# Payment Gateway Integration - Technical Design Document

**Date:** 2026-03-30  
**Purpose:** Multi-Gateway Payment Integration with Idempotency and Reliability Guarantees  
**Scope:** Stripe, PayPal, Amadeus, Paymob, Cash on Delivery

---

## 1. Overview

This document describes the actual payment architecture implemented in this system. The core design follows the **"Order First, Pay Last"** pattern with idempotency protection and webhook-based final confirmation.

### Key Features
- ✅ **Order First** — Order saved as `PENDING` before any money moves
- ✅ **`orderId` embedded in Stripe metadata** — webhook always knows which order to confirm
- ✅ **Idempotency keys** — prevents double-charges on retries and network failures
- ✅ **DB-level idempotency guard** — `PaymentAttempt` deduplicated by `idempotencyKey`
- ✅ **Webhook-based final confirmation** — authoritative server-to-server confirmation
- ✅ **3D Secure / SCA compliant** — via Payment Intents API
- ✅ **Strategy pattern** — provider-agnostic (Stripe, PayPal, COD, etc.)

---

## 2. Why "Order First, Pay Last"?

The alternative ("Pay First, Order on Webhook") creates an unsolvable problem:

> **Problem:** If payment succeeds but the connection drops before your server records the `orderId`, you have taken money but don't know which order it's for.

By creating the order **before** calling Stripe and embedding its `orderId` in the Payment Intent metadata:

- Stripe permanently stores the `orderId` — survives any connection drop
- Webhook receives the event with `orderId` in `paymentIntent.metadata.orderId`
- Even without your DB, manual reconciliation via the Stripe dashboard shows the order

---

## 3. Complete Payment Flow

```mermaid
flowchart TD
    Start([User: POST /orders]) --> LockCart[Lock Cart]
    LockCart --> ValidateCart[Validate Cart]
    ValidateCart --> CheckInventory[Check Inventory]
    CheckInventory --> CreateOrder["Create Order\n(status: PENDING)"]
    CreateOrder --> CheckIdempotency{PaymentAttempt\nalready exists?}

    CheckIdempotency -->|Yes — same key| ReturnExisting[Return existing\nPaymentAttempt result]
    CheckIdempotency -->|No| CreateAttempt[Create PaymentAttempt\nstatus: PENDING]

    CreateAttempt --> CallStripe["Call Stripe\nPaymentIntents.create()\nwith orderId in metadata"]
    CallStripe --> ReturnSecret[Return clientSecret\nto Frontend]

    ReturnSecret --> UserPays{User pays\non frontend}
    UserPays -->|Simple card| Instant[Payment succeeds]
    UserPays -->|3D Secure / OTP| Redirect[Bank redirect]
    UserPays -->|Abandons| Stale[Stale PENDING order]

    Redirect --> BankConfirm[User enters OTP]
    BankConfirm --> Instant

    Instant --> WebhookSuccess["Webhook:\npayment_intent.succeeded"]
    WebhookSuccess --> VerifySig[Verify signature]
    VerifySig --> ReadOrderId["Read orderId\nfrom paymentIntent.metadata"]

    ReadOrderId --> UpdateOrder["Update Order → CONFIRMED\nUpdate PaymentAttempt → SUCCESS\nClear Cart\nReduce Inventory"]
    UpdateOrder --> SendEmail[Send email]
    SendEmail --> Done([Order Confirmed])

    Stale --> CronJob["Cron: detect stale\nPENDING > 30 min"]
    CronJob --> CancelIntent[Cancel PaymentIntent\nin Stripe]
    CancelIntent --> MarkCancelled["Order → CANCELLED\nPaymentAttempt → FAILED\nRestore inventory"]

    style CreateOrder fill:#fff3cd
    style WebhookSuccess fill:#d4edda
    style UpdateOrder fill:#d4edda
    style Stale fill:#f8d7da
    style MarkCancelled fill:#f8d7da
```

---

## 4. Idempotency — Preventing Double Charges

### The Problem

A customer clicks "Place Order" twice quickly, or the network retries the request. Without idempotency, Stripe could be called twice and the customer charged twice.

### Two-Layer Idempotency Defense

#### Layer 1: DB-level guard via `PaymentAttempt`

Before calling Stripe, check if a `PaymentAttempt` already exists for this `idempotencyKey`:

```typescript
const idempotencyKey = `order_${orderId}`;  // Tied to THIS order

// Check first
const existing = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);

if (existing) {
    if (existing.status === PaymentAttemptStatus.SUCCESS) {
        // Already paid — return success, do NOT call Stripe again
        return { success: true, transactionId: existing.transactionId };
    }
    if (existing.status === PaymentAttemptStatus.PENDING) {
        // In flight — return the existing clientSecret, do NOT create a new intent
        return { clientSecret: existing.clientSecret };
    }
    // FAILED — allowed to retry with a new attempt
}

// Safe to create a new attempt + call Stripe
```

> [!IMPORTANT]
> The idempotency key is `order_${orderId}`, NOT `cart_${customerId}_${restaurantId}`. Tying it to the order ensures each order gets exactly one payment attempt. If the customer abandons and re-orders, a new `orderId` → new key → fresh attempt.

#### Layer 2: Stripe-level idempotency key

Stripe deduplicates on its end for 24 hours using the same key:

```typescript
await stripe.paymentIntents.create(
    { amount, currency, metadata: { orderId } },
    { idempotencyKey: `order_${orderId}` }  // ← Stripe deduplicates here too
);
```

If your server calls Stripe twice with the same key within 24 hours (e.g., due to a crash-restart), Stripe returns the **same** PaymentIntent — no double charge.

### Idempotency Key Design

| Scenario | Key | Result |
|----------|-----|--------|
| Same request, twice | `order_<orderId>` | Layer 1 returns existing attempt |
| Server crash, retry | `order_<orderId>` | Layer 2 (Stripe) returns same intent |
| Customer re-orders after cancel | New `orderId` → new key | Fresh payment allowed |
| Cart retry (no orderId yet) | ❌ Never tie key to cart | Cart ID is not stable enough |

---

## 5. Actual Handler Chain

```
LockCartHandler
  → ValidateCartHandler
    → CheckInventoryHandler
      → CreateOrderHandler       ← Order created: PENDING
        → ProcessPaymentHandler  ← Stripe called with orderId in metadata
          → ParallelOrderHandler (fire & forget):
              - UpdateOrderStatusHandler   ← PENDING (webhook will set CONFIRMED)
              - ReduceInventoryHandler
              - ClearCartHandler
              - UnlockCartHandler
              - NotifyRestaurantHandler
              - NotifyCustomerHandler
              - AuditLogHandler
```

> [!IMPORTANT]
> `ProcessPaymentHandler` runs **outside** any database transaction. External API calls (Stripe) must never be inside a DB transaction — they can't be rolled back and will cause timeouts if the DB transaction takes too long.

### What happens if `ProcessPaymentHandler` throws?

The order is already `PENDING` in the DB. Two recovery paths:

1. **If Stripe was never called** (error before the API call): Mark order `CANCELLED`, restore inventory. Safe to retry.
2. **If Stripe was called but we didn't get the response** (network drop): The `idempotencyKey` on Stripe means calling again returns the same PaymentIntent. The webhook will eventually confirm the order if payment succeeded.

---

## 6. Webhook Handler — The Authoritative Confirmation

```mermaid
sequenceDiagram
    participant Stripe
    participant Webhook
    participant DB

    Stripe->>Webhook: POST /webhooks/stripe (payment_intent.succeeded)
    Webhook->>Webhook: Verify signature with STRIPE_WEBHOOK_SECRET
    Webhook->>DB: Check if PaymentAttempt already SUCCESS (idempotency)
    DB-->>Webhook: Not yet

    Webhook->>DB: BEGIN TRANSACTION
    Webhook->>DB: Read orderId from paymentIntent.metadata.orderId
    Webhook->>DB: Update Order status → CONFIRMED
    Webhook->>DB: Update PaymentAttempt → SUCCESS, transactionId
    Webhook->>DB: Clear Cart
    Webhook->>DB: Reduce Inventory
    Webhook->>DB: COMMIT

    Webhook-->>Stripe: 200 OK (within 30s or Stripe retries)
    Webhook->>Stripe: (async) Send confirmation email
```

### Webhook Idempotency — Handling Retries

Stripe retries webhooks for up to **72 hours** if your server returns non-2xx. Your handler **must** be idempotent:

```typescript
private async handlePaymentSuccess(paymentIntent: any) {
    const orderId = paymentIntent.metadata.orderId; // ← from Stripe metadata
    const idempotencyKey = `order_${orderId}`;

    // Guard: already processed?
    const attempt = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);
    if (attempt?.status === PaymentAttemptStatus.SUCCESS) {
        return; // Already done — return 200 so Stripe stops retrying
    }

    await prisma.$transaction(async (tx) => {
        // Update order
        await orderRepository.updateOrderStatus({ orderId, newOrderStatus: OrderStatusKey.CONFIRMED }, tx);

        // Finalize payment attempt
        await paymentAttemptRepository.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.SUCCESS,
            paymentIntent.id,        // transactionId
            { amount: paymentIntent.amount / 100 }
        );

        // Clear cart, reduce inventory
        await cartService.clearCart(customerId, tx);
    });
}
```

---

## 7. Stale PENDING Order Recovery (Cron Job)

If the customer abandons after the order is created but before paying:

```typescript
// Runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    const staleOrders = await orderRepository.findStaleOrders({
        status: OrderStatusKey.PENDING,
        createdBefore: cutoff
    });

    for (const order of staleOrders) {
        // Cancel in Stripe if a PaymentIntent exists
        const attempt = await paymentAttemptRepository.findByOrderId(order.orderId);
        if (attempt?.transactionId) {
            await stripe.paymentIntents.cancel(attempt.transactionId).catch(() => {});
        }

        // Mark cancelled in DB
        await orderRepository.updateOrderStatus({
            orderId: order.orderId,
            newOrderStatus: OrderStatusKey.CANCELLED
        });

        // Restore inventory
        await menuItemService.restoreStockBatch(order.orderId);
    }
});
```

---

## 8. Stripe PaymentIntent — What Must Be in Metadata

When creating the PaymentIntent, always include:

```typescript
await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'usd',
    customer: stripeCustomerId,
    metadata: {
        orderId: order.orderId,           // ← CRITICAL: webhook uses this
        customerId: context.customerId,   // for debugging/reconciliation
        restaurantId: context.restaurantId
    },
    automatic_payment_methods: { enabled: true }
}, {
    idempotencyKey: `order_${order.orderId}`  // ← CRITICAL: prevents double charge
});
```

> [!CAUTION]
> If you forget `metadata.orderId`, the webhook cannot identify which order was paid. You'll have taken money with no way to fulfill the order automatically.

---

## 9. Database Schema

```prisma
model PaymentAttempt {
  idempotencyKey String              @id @map("idempotency_key")
  orderId        String?             @map("order_id")
  status         PaymentAttemptStatus
  provider       String
  transactionId  String?             @map("transaction_id")  // Stripe PaymentIntent ID
  responseData   Json?               @map("response_data")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  order Order? @relation(fields: [orderId], references: [orderId])

  @@index([orderId])
  @@index([transactionId])
  @@map("payment_attempts")
}

enum PaymentAttemptStatus {
  PENDING   // Created, Stripe called, waiting for webhook
  SUCCESS   // Webhook confirmed payment_intent.succeeded
  FAILED    // Webhook confirmed payment_intent.payment_failed, or cron cancelled
}
```

---

## 10. Failure Scenarios & Recovery

| Scenario | What Happens | Recovery |
|----------|-------------|----------|
| **Client disconnects after order created, before Stripe called** | Order is `PENDING`, no PaymentAttempt | Cron cancels after 30 min |
| **Stripe call succeeds, server crashes before response stored** | Order is `PENDING`, Stripe has PaymentIntent with `orderId` | Webhook fires → finds `orderId` in metadata → confirms order |
| **Webhook fails (server down)** | Stripe retries for 72 hours | Server comes back up → webhook processed |
| **Webhook fires twice** (Stripe retry) | Second call: attempt already `SUCCESS` → early return 200 | No duplicate order update |
| **Customer pays again after PENDING** | Same `idempotencyKey` → Layer 1 returns existing attempt | No double charge |
| **DB transaction rolls back in webhook** | Returns 5xx → Stripe retries | Retried webhook succeeds on next attempt |

---

## 11. Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # NEVER skip this — prevents fake webhooks
FRONTEND_URL=http://localhost:3000
```

---

## 12. Testing Checklist

### Start Testing

```bash
# Terminal 1
npm run dev

# Terminal 2 — forward webhooks
stripe listen --forward-to localhost:3000/webhooks/stripe
# Copy the whsec_... shown into .env as STRIPE_WEBHOOK_SECRET
```

### Test Scenarios

| Scenario | Card | Expected |
|----------|------|----------|
| Normal payment | `4242 4242 4242 4242` | Order → CONFIRMED |
| 3D Secure | `4000 0025 0000 3155` | OTP prompt → Order → CONFIRMED |
| Declined | `4000 0000 0000 0002` | PaymentAttempt → FAILED |
| Double request | Same request twice fast | Second request returns existing attempt |
| Abandon order | Do nothing | Cron cancels after 30 min |
| Webhook retry | `stripe trigger payment_intent.succeeded` twice | Second is no-op (idempotent) |

---

## 13. Future Enhancements

- [ ] Saved payment methods (store Stripe customer ID in `ProviderCustomer`)
- [ ] Partial refunds
- [ ] PayPal / Amadeus / Paymob strategies
- [ ] React/Vue frontend (replace EJS)
- [ ] Payment analytics dashboard
- [ ] Multi-currency support
