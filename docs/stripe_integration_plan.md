# Stripe Payment Intents Integration Plan

## Goal
Implement a complete Stripe integration using Payment Intents API with EJS test page and webhook support for multiple payment providers (Stripe, PayPal, Amadeus, Paymob).

---

## Phase 1: Payment Intents Backend (2-3 hours)

### 1.1 Update IPaymentStrategy Interface

**File**: `src/services/payment/strategies/IPaymentStrategy.ts`

**Changes**:
```typescript
interface PaymentIntentResult {
    clientSecret: string;
    paymentIntentId: string;
}

interface IPaymentStrategy {
    // NEW: Create payment intent (returns client_secret for frontend)
    createPaymentIntent(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentIntentResult>;
    
    // KEEP: For backwards compatibility and non-Stripe providers
    process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult>;
    
    refund(
        transactionId: string,
        amount: number
    ): Promise<RefundResult>;
}
```

---

### 1.2 Create ProviderCustomerRepository

**File**: `src/repositories/ProviderCustomerRepository.ts` [NEW]

**Purpose**: Manage provider-customer mappings

```typescript
class ProviderCustomerRepository {
    async findByCustomerAndProvider(customerId: string, provider: string);
    async create(data: { customerId, provider, externalCustomerId });
    async updateExternalId(customerId: string, provider: string, externalCustomerId: string);
}
```

---

### 1.3 Create ProviderCustomerService

**File**: `src/services/ProviderCustomerService.ts` [NEW]

**Purpose**: Business logic for provider customers

```typescript
class ProviderCustomerService {
    async getOrCreateStripeCustomer(customerId: string, email: string): Promise<string>;
    async getProviderCustomerId(customerId: string, provider: string): Promise<string | null>;
}
```

---

### 1.4 Update StripeStrategy

**File**: `src/services/payment/strategies/StripeStrategy.ts`

**Changes**:
1. Add `createPaymentIntent()` method
2. Update `process()` to use Payment Intents (for webhook confirmation)
3. Keep existing `refund()` method

**Key Logic**:
```typescript
async createPaymentIntent(amount, metadata, idempotencyKey) {
    // 1. Get or create Stripe customer
    const stripeCustomerId = await providerCustomerService.getOrCreateStripeCustomer(
        metadata.customerId,
        metadata.email
    );
    
    // 2. Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        customer: stripeCustomerId,
        metadata: { orderId: metadata.orderId },
        automatic_payment_methods: { enabled: true }
    }, { idempotencyKey });
    
    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
    };
}
```

---

### 1.5 Update PaymentService

**File**: `src/services/payment.service.ts`

**Changes**:
Add new method for creating payment intents:

```typescript
async createPaymentIntent(
    customerId: string,
    amount: number,
    orderId: string
): Promise<PaymentIntentResult> {
    const settings = await preferredPaymentSettingsService.getCustomerSettings(customerId);
    const selectedMethod = settings.paymentMethods.find(
        pm => pm.paymentMethodId === settings.paymentMethodId
    );
    
    const provider = selectedMethod.paymentMethodData?.['provider'];
    const strategy = PaymentStrategyFactory.getStrategy(provider);
    
    const idempotencyKey = `order_${orderId}`;
    return await strategy.createPaymentIntent(amount, { customerId, orderId }, idempotencyKey);
}
```

---

## Phase 2: EJS Test Page (1-2 hours)

### 2.1 Install Dependencies

```bash
npm install ejs
```

---

### 2.2 Configure Express for EJS

**File**: `src/server.ts`

```typescript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
```

---

### 2.3 Create EJS Checkout Page

**File**: `views/checkout.ejs` [NEW]

**Purpose**: Test page with Stripe Elements

```html
<!DOCTYPE html>
<html>
<head>
    <title>Stripe Checkout Test</title>
    <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
    <h1>Test Stripe Payment</h1>
    <form id="payment-form">
        <div id="payment-element"></div>
        <button id="submit">Pay $<%= amount %></button>
        <div id="error-message"></div>
    </form>
    
    <script>
        const stripe = Stripe('<%= stripePublishableKey %>');
        const clientSecret = '<%= clientSecret %>';
        
        const elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
        
        document.getElementById('payment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: 'http://localhost:3000/payment/success'
                }
            });
            
            if (error) {
                document.getElementById('error-message').textContent = error.message;
            }
        });
    </script>
</body>
</html>
```

---

### 2.4 Create Test Routes

**File**: `src/routes/payment.routes.ts` [NEW]

```typescript
router.get('/test-checkout', async (req, res) => {
    // Create test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // $50.00
        currency: 'usd',
        automatic_payment_methods: { enabled: true }
    });
    
    res.render('checkout', {
        clientSecret: paymentIntent.client_secret,
        amount: 50,
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

router.get('/success', (req, res) => {
    res.send('<h1>Payment Successful!</h1>');
});
```

---

## Phase 3: Webhooks (1-2 hours)

### 3.1 Create Webhook Handler

**File**: `src/controllers/webhook.controller.ts` [NEW]

```typescript
class WebhookController {
    async handleStripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        try {
            const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                case 'charge.refunded':
                    await this.handleRefund(event.data.object);
                    break;
            }
            
            res.json({ received: true });
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
    
    private async handlePaymentSuccess(paymentIntent) {
        const orderId = paymentIntent.metadata.orderId;
        
        // Update PaymentAttempt
        await paymentAttemptService.finalizeAttempt(
            `order_${orderId}`,
            true,
            paymentIntent.id,
            { amount: paymentIntent.amount / 100 }
        );
        
        // Update Order status
        await orderRepository.updateOrderStatus({
            orderId,
            newOrderStatus: OrderStatusKey.CONFIRMED
        });
    }
}
```

---

### 3.2 Create Webhook Route

**File**: `src/routes/webhook.routes.ts` [NEW]

```typescript
import express from 'express';

const router = express.Router();

// IMPORTANT: Use raw body for signature verification
router.post('/stripe', 
    express.raw({ type: 'application/json' }),
    webhookController.handleStripeWebhook
);

export default router;
```

---

### 3.3 Update server.ts

**File**: `src/server.ts`

```typescript
// BEFORE other middleware
app.use('/webhooks', webhookRoutes); // Raw body for webhooks

// THEN add JSON middleware
app.use(express.json());
```

---

## Phase 4: Environment Variables

**File**: `.env`

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (future)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Amadeus (future)
AMADEUS_API_KEY=...

# Paymob (future)
PAYMOB_API_KEY=...
```

---

## Testing Plan

### Manual Testing Steps

1. **Start Server**:
   ```bash
   npm run dev
   ```

2. **Visit Test Page**:
   ```
   http://localhost:3000/payment/test-checkout
   ```

3. **Use Stripe Test Cards**:
   - Success: `4242 4242 4242 4242`
   - 3D Secure: `4000 0025 0000 3155`
   - Decline: `4000 0000 0000 0002`

4. **Test Webhooks Locally** (using Stripe CLI):
   ```bash
   stripe listen --forward-to localhost:3000/webhooks/stripe
   stripe trigger payment_intent.succeeded
   ```

---

## File Structure

```
src/
├── controllers/
│   └── webhook.controller.ts [NEW]
├── repositories/
│   └── ProviderCustomerRepository.ts [NEW]
├── routes/
│   ├── payment.routes.ts [NEW]
│   └── webhook.routes.ts [NEW]
├── services/
│   ├── ProviderCustomerService.ts [NEW]
│   └── payment/
│       └── strategies/
│           └── StripeStrategy.ts [MODIFY]
└── utils/
    └── payment/
        └── stripe.ts [EXISTS]

views/
└── checkout.ejs [NEW]

public/
└── (static assets if needed)
```

---

## Migration Checklist

- [x] Add `ProviderCustomer` model to schema
- [ ] Run Prisma migration
- [ ] Create `ProviderCustomerRepository`
- [ ] Create `ProviderCustomerService`
- [ ] Update `IPaymentStrategy` interface
- [ ] Update `StripeStrategy` with Payment Intents
- [ ] Install `ejs` package
- [ ] Configure Express for EJS
- [ ] Create `checkout.ejs` view
- [ ] Create payment test routes
- [ ] Create webhook controller
- [ ] Create webhook routes
- [ ] Update `server.ts` for webhooks
- [ ] Add environment variables
- [ ] Test with Stripe test cards
- [ ] Test webhooks with Stripe CLI

---

## Future Enhancements

1. **Saved Payment Methods**: Allow users to save cards for future use
2. **PayPal Integration**: Implement `PayPalStrategy.createPaymentIntent()`
3. **Amadeus Integration**: Implement `AmadeusStrategy.createPaymentIntent()`
4. **Paymob Integration**: Create `PaymobStrategy` class
5. **React/Vue Frontend**: Migrate EJS logic to modern frontend framework
6. **Subscription Support**: Add recurring payment handling
7. **Dispute Handling**: Add webhook handlers for `charge.dispute.created`
