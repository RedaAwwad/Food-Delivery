# Stripe Payment Intents Integration Plan

## Goal
Migrate `StripeStrategy` from the legacy Charges API to **Payment Intents API**, wire it into the existing handler chain architecture, and implement full idempotency + webhook confirmation.

---

## Architecture: Order First, Pay Last

The handler chain already creates the order **before** payment:

```
CreateOrderHandler (PENDING)  →  ProcessPaymentHandler  →  Webhook confirms → COMPLETED
```

The key requirement for reliability is:

1. **`orderId` must be in Stripe metadata** — so the webhook can locate the order
2. **Idempotency key = `order_${orderId}`** — not cart-based
3. **`PaymentAttempt` checked before Stripe call** — DB-level dedup

---

## Phase 1: Update IPaymentStrategy Interface

**File**: `src/services/payment/strategies/IPaymentStrategy.ts`

```typescript
export interface PaymentIntentResult {
    clientSecret: string;
    paymentIntentId: string;
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    message?: string;
}

export interface RefundResult {
    success: boolean;
    refundId: string;
    message?: string;
}

export interface IPaymentStrategy {
    // For async webhook flow (Stripe, PayPal)
    createPaymentIntent(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string },
        idempotencyKey: string
    ): Promise<PaymentIntentResult>;

    // For synchronous flow (Cash on Delivery, direct charge)
    process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult>;

    refund(transactionId: string, amount: number): Promise<RefundResult>;
}
```

---

## Phase 2: Update StripeStrategy

**File**: `src/services/payment/strategies/StripeStrategy.ts`

Rewrite `process()` to use Payment Intents, add `createPaymentIntent()`:

```typescript
import { IPaymentStrategy, PaymentIntentResult, PaymentResult, RefundResult } from './IPaymentStrategy';
import stripe from '../../../utils/payment/stripe';
import { providerCustomerService } from '../../ProviderCustomerService';
import { BadRequestError } from '../../../utils/errors';

export class StripeStrategy implements IPaymentStrategy {

    async createPaymentIntent(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string },
        idempotencyKey: string
    ): Promise<PaymentIntentResult> {
        // Get or create Stripe customer for saved cards / receipts
        const stripeCustomerId = await providerCustomerService.getOrCreateStripeCustomer(
            metadata.customerId,
            metadata.email
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // cents
            currency: 'usd',
            customer: stripeCustomerId,
            metadata: {
                orderId: metadata.orderId,          // CRITICAL: webhook reads this
                customerId: metadata.customerId,
                restaurantId: metadata.restaurantId
            },
            automatic_payment_methods: { enabled: true }
        }, { idempotencyKey });                     // CRITICAL: Stripe-level dedup

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id
        };
    }

    async process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult> {
        // Legacy synchronous path — kept for backward compatibility
        // New flow uses createPaymentIntent() + webhooks
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            metadata,
            confirm: true,                  // confirm immediately (no 3DS)
            payment_method: metadata.paymentMethodId,
            automatic_payment_methods: { enabled: true, allow_redirects: 'never' }
        }, { idempotencyKey });

        return {
            success: paymentIntent.status === 'succeeded',
            transactionId: paymentIntent.id,
            message: `Payment status: ${paymentIntent.status}`
        };
    }

    async refund(transactionId: string, amount: number): Promise<RefundResult> {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: transactionId,  // use payment_intent, not charge
                amount: Math.round(amount * 100)
            });

            return {
                success: refund.status === 'succeeded',
                refundId: refund.id,
                message: 'Refund processed successfully'
            };
        } catch (error: any) {
            console.error('[Stripe] Refund failed:', error);
            return { success: false, refundId: '', message: error.message };
        }
    }
}
```

---

## Phase 3: Update PaymentService

**File**: `src/services/PaymentService.ts`

Add `createPaymentIntent()` with the DB-level idempotency guard:

```typescript
import { PaymentStrategyFactory } from './payment/PaymentStrategyFactory';
import { preferredPaymentSettingsService } from './PreferredPaymentSettingsService';
import { paymentAttemptService } from './PaymentAttemptService';  // use service, not repo directly
import { PaymentAttemptStatus } from '../generated/prisma/client';
import { InternalServerError, UnprocessableEntityError } from '../utils/errors/error-factories';
import { PaymentIntentResult } from './payment/strategies/IPaymentStrategy';

export class PaymentService {

    /**
     * Creates a Stripe PaymentIntent for an already-created order.
     * Idempotency is enforced at both the DB level (PaymentAttempt)
     * and the Stripe level (idempotencyKey).
     */
    async createPaymentIntent(
        customerId: string,
        orderId: string,
        amount: number,
        email: string,
        restaurantId: string,
        requestTimestamp: Date
    ): Promise<PaymentIntentResult> {
        const idempotencyKey = `order_${orderId}`;

        // --- Layer 1: DB idempotency guard ---
        const existing = await paymentAttemptService.findAttempt(idempotencyKey);
        if (existing) {
            if (existing.status === PaymentAttemptStatus.SUCCESS) {
                // Already paid — should not reach here in normal flow
                throw UnprocessableEntityError("Order has already been paid");
            }
            if (existing.status === PaymentAttemptStatus.PENDING && (existing.responseData as any)?.clientSecret) {
                // In-flight — return the existing clientSecret
                return {
                    clientSecret: (existing.responseData as any).clientSecret,
                    paymentIntentId: existing.transactionId!
                };
            }
        }

        // --- Get payment provider ---
        const settings = await preferredPaymentSettingsService.getCustomerSettings(customerId);
        const preferredMethod = settings.paymentMethods.find(
            pm => pm.paymentMethodId === settings.paymentMethodId
        );

        if (!preferredMethod) throw InternalServerError("Preferred payment method not set");

        const provider = (preferredMethod.paymentMethodData as any)?.provider;
        if (!provider) throw UnprocessableEntityError("Payment method configuration missing provider");

        const strategy = PaymentStrategyFactory.getStrategy(provider);

        // --- Record PENDING attempt BEFORE calling Stripe ---
        // (so if Stripe call crashes, the cron job can clean up)
        await paymentAttemptService.createPendingAttempt(idempotencyKey, orderId, provider, requestTimestamp);

        // --- Layer 2: Stripe-level idempotency (same key) ---
        const result = await strategy.createPaymentIntent(
            amount,
            { orderId, customerId, restaurantId, email },
            idempotencyKey
        );

        // Store clientSecret in responseData so we can return it on retry
        await paymentAttemptService.finalizeAttempt(
            idempotencyKey,
            false,           // not finalized yet — still PENDING
            result.paymentIntentId,
            { clientSecret: result.clientSecret },
            requestTimestamp
        );
        // Note: status stays PENDING until webhook fires

        return result;
    }

    // Legacy synchronous process() — kept for CashOnDelivery etc.
    async processPayment(
        customerId: string,
        amount: number,
        idempotencyKey: string,
        requestTimestamp: Date
    ) {
        const settings = await preferredPaymentSettingsService.getCustomerSettings(customerId);
        const preferredMethod = settings.paymentMethods.find(
            pm => pm.paymentMethodId === settings.paymentMethodId
        );
        if (!preferredMethod) throw InternalServerError("Preferred payment method not set");

        const provider = (preferredMethod.paymentMethodData as any)?.provider;
        const strategy = PaymentStrategyFactory.getStrategy(provider);

        return strategy.process(amount, { ...preferredMethod.paymentMethodData as any, requestTimestamp }, idempotencyKey);
    }
}

export const paymentService = new PaymentService();
```

---

## Phase 4: Update ProcessPaymentHandler

**File**: `src/handlers/order/ProcessPaymentHandler.ts`

Extend context to carry the `clientSecret` back to the caller:

```typescript
import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { paymentService } from "../../services/PaymentService";
import { InternalServerError } from "../../utils/errors";

export class ProcessPaymentHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.order) throw InternalServerError("Order not found in context (ProcessPayment)");

        const idempotencyKey = `order_${context.order.orderId}`; // tied to order, not cart

        const result = await paymentService.createPaymentIntent(
            context.customerId,
            context.order.orderId,
            context.order.totalAmount,
            context.customerEmail,    // add to OrderContext
            context.restaurantId,
            context.requestTimestamp
        );

        context.paymentResult = {
            success: true,
            transactionId: result.paymentIntentId
        };
        context.clientSecret = result.clientSecret; // return to API caller
    }
}
```

Add to `OrderContext`:
```typescript
export interface OrderContext {
    customerId: string;
    restaurantId: string;
    customerEmail: string;   // ← ADD
    requestTimestamp: Date;
    tx?: PrismaTx;
    cartItems?: CartItemSummary[];
    order?: any;
    clientSecret?: string;   // ← ADD: returned to frontend
    paymentResult?: { success: boolean; transactionId?: string; };
    finalOrder?: any;
    errors?: string[];
    isCartLocked?: boolean;
    shouldReduceInventory?: boolean;
    shouldClearCart?: boolean;
}
```

---

## Phase 5: Webhook Handler

**File**: `src/controllers/stripeWebhook.controller.ts` [NEW]

```typescript
import { Request, Response } from 'express';
import stripe from '../utils/payment/stripe';
import { prisma } from '../config/prisma.config';
import { orderRepository } from '../repositories/order.repository';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';
import { cartService } from '../services/cart.service';
import { menuItemService } from '../services/menuItem.service';
import { PaymentAttemptStatus, OrderStatusKey } from '../generated/prisma/client';

class StripeWebhookController {
    async handleStripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        try {
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );

            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handleSuccess(event.data.object as any);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handleFailure(event.data.object as any);
                    break;
            }

            res.json({ received: true });
        } catch (err: any) {
            console.error('[Webhook] Error:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    private async handleSuccess(paymentIntent: any) {
        const { orderId, customerId } = paymentIntent.metadata;
        const idempotencyKey = `order_${orderId}`;

        // Webhook idempotency guard — Stripe may retry
        const attempt = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);
        if (attempt?.status === PaymentAttemptStatus.SUCCESS) return; // already done

        await prisma.$transaction(async (tx) => {
            // COMPLETED is the correct enum value (not CONFIRMED)
            await orderRepository.updateOrderStatus(
                { orderId, newOrderStatus: OrderStatusKey.COMPLETED }, tx
            );

            await paymentAttemptRepository.updateStatus(
                idempotencyKey,
                PaymentAttemptStatus.SUCCESS,
                paymentIntent.id,
                { amount: paymentIntent.amount / 100 }
            );

            await cartService.clearCart(customerId, tx);
        });
        // Note: inventory was already reduced by ReduceInventoryHandler in the chain.
        // No inventory action needed here on success.
    }

    private async handleFailure(paymentIntent: any) {
        const { orderId } = paymentIntent.metadata;
        const idempotencyKey = `order_${orderId}`;

        await paymentAttemptRepository.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.FAILED,
            paymentIntent.id,
            { error: paymentIntent.last_payment_error }
        );

        // CANCELED is the correct enum value (not CANCELLED)
        await orderRepository.updateOrderStatus({
            orderId,
            newOrderStatus: OrderStatusKey.CANCELED
        });

        // Restore inventory — menuItemService.restoreStock (not restoreStockBatch)
        await menuItemService.restoreStock(orderId);
    }
}

export const stripeWebhookController = new StripeWebhookController();
```

---

## Phase 6: Webhook Route

**File**: `src/routes/webhook.routes.ts` [NEW]

```typescript
import express from 'express';
import { stripeWebhookController } from '../controllers/stripeWebhook.controller';

const router = express.Router();

// Raw body REQUIRED for Stripe signature verification
router.post('/stripe',
    express.raw({ type: 'application/json' }),
    (req, res) => stripeWebhookController.handleStripeWebhook(req, res)
);

export default router;
```

**File**: `src/server.ts` — mount BEFORE `express.json()`:

```typescript
import webhookRoutes from './routes/webhook.routes';

app.use('/webhooks', webhookRoutes); // ← BEFORE json middleware
app.use(express.json());
```

---

## Phase 7: Stale Order Cleanup Cron

**File**: `src/jobs/staleOrder.job.ts` [NEW]

```typescript
import cron from 'node-cron';
import stripe from '../utils/payment/stripe';
import { orderRepository } from '../repositories/order.repository';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';
import { menuItemService } from '../services/menuItem.service';
import { OrderStatusKey, PaymentAttemptStatus } from '../generated/prisma/client';

export function startStaleOrderJob() {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const cutoff = new Date(Date.now() - 30 * 60 * 1000);

            // findStaleOrders() must be added to OrderRepository — see checklist
            const staleOrders = await orderRepository.findStaleOrders({
                status: OrderStatusKey.PENDING,
                createdBefore: cutoff
            });

            for (const order of staleOrders) {
                const attempt = await paymentAttemptRepository.findByOrderId(order.orderId);

                if (attempt?.transactionId) {
                    // Cancel in Stripe (ignore if already cancelled)
                    await stripe.paymentIntents.cancel(attempt.transactionId).catch(() => {});
                }

                // CANCELED is the correct enum value (not CANCELLED)
                await orderRepository.updateOrderStatus({
                    orderId: order.orderId,
                    newOrderStatus: OrderStatusKey.CANCELED
                });

                // restoreStock() is the correct method on menuItemService
                await menuItemService.restoreStock(order.orderId);
            }
        } catch (error: any) {
            console.error('[Cron] Stale order cleanup failed:', error.message);
        }
    });
}
```

---

## Migration Checklist

- [ ] Update `IPaymentStrategy` — add `createPaymentIntent()`, keep `process()`
- [ ] Rewrite `StripeStrategy` — Payment Intents API + `orderId` in metadata
- [ ] Update `PaymentService` — add `createPaymentIntent()` with idempotency guard
- [ ] Update `ProcessPaymentHandler` — use `createPaymentIntent()`, return `clientSecret`
- [ ] Add `customerEmail` and `clientSecret` to `OrderContext`
- [ ] Create `StripeWebhookController`
- [ ] Create `webhook.routes.ts` — raw body middleware
- [ ] Mount webhook routes BEFORE `express.json()` in `server.ts`
- [ ] Create `staleOrder.job.ts` cron
- [ ] Add `findStaleOrders()` to `OrderRepository`
- [ ] Set `STRIPE_WEBHOOK_SECRET` in `.env`
- [ ] Test with Stripe CLI (`stripe listen --forward-to localhost:3000/webhooks/stripe`)

---

## Testing Plan

```bash
# 1. Start server
npm run dev

# 2. Forward webhooks (copy the whsec_... into .env)
stripe listen --forward-to localhost:3000/webhooks/stripe

# 3. Test cards
# Success:   4242 4242 4242 4242
# 3D Secure: 4000 0025 0000 3155
# Decline:   4000 0000 0000 0002

# 4. Test webhook idempotency
stripe trigger payment_intent.succeeded  # trigger twice — second should be no-op
```
