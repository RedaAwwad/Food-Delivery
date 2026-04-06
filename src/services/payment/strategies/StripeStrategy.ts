import { IPaymentStrategy, PaymentIntentResult, PaymentResult, RefundResult } from './IPaymentStrategy';
import stripe from '../../../utils/payment/stripe';
import { BadRequestError } from '../../../utils/errors';

export class StripeStrategy implements IPaymentStrategy {

    /**
     * Creates a Stripe PaymentIntent.
     * - Embeds orderId in metadata so the webhook can locate the order.
     * - Uses idempotencyKey to prevent duplicate intents on retries.
     */
    async createPaymentIntent(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string; savedMethodData?: any },
        idempotencyKey: string
    ): Promise<PaymentIntentResult> {
        console.log(`[Stripe] Creating PaymentIntent for order ${metadata.orderId}, amount ${amount}`);

        const intentParams: any = {
            amount: Math.round(amount * 100), // convert to cents
            currency: 'usd',
            metadata: {
                orderId: metadata.orderId,           // CRITICAL: webhook reads this to find the order
                customerId: metadata.customerId,
                restaurantId: metadata.restaurantId,
            },
            automatic_payment_methods: { enabled: true },
        };

        // If reusing a saved card from our DB
        if (metadata.savedMethodData && metadata.savedMethodData.stripePaymentMethodId) {
            intentParams.payment_method = metadata.savedMethodData.stripePaymentMethodId;
            if (metadata.savedMethodData.stripeCustomerId) {
                intentParams.customer = metadata.savedMethodData.stripeCustomerId;
            }
        } else {
            // New card: tell Stripe we plan to Vault this card for future off-session use
            intentParams.setup_future_usage = 'off_session';
        }

        const paymentIntent = await stripe.paymentIntents.create(intentParams, { idempotencyKey }); // CRITICAL: Stripe deduplicates for 24h on same key

        console.log(`[Stripe] PaymentIntent created: ${paymentIntent.id}`);

        return {
            clientSecret: paymentIntent.client_secret!,
            paymentIntentId: paymentIntent.id,
        };
    }

    /**
     * Legacy synchronous charge — kept for Cash on Delivery and backward compatibility.
     * New Stripe flow uses createPaymentIntent() + webhooks.
     */
    async process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult> {
        try {
            if (!metadata.cardToken && !metadata.customerId) throw BadRequestError("Missing cardToken or customerId for Stripe payment");

            console.log(`[Stripe] Processing payment of ${amount} for ${metadata.customerId || 'guest'}`);

            const params: any = {
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                source: metadata.cardToken,
                description: `Order payment`,
                metadata: {
                    ...metadata,
                    integration_check: 'accept_a_payment',
                },
            };

            // If customerId is provided, use it (assuming customer exists in Stripe)
            // But for this simple implementation, we rely on source (token)
            if (metadata.stripeCustomerId) params.customer = metadata.stripeCustomerId;

            const charge = await stripe.charges.create(params, { idempotencyKey });

            return {
                success: charge.status === 'succeeded',
                transactionId: charge.id,
                message: charge.status === 'succeeded'
                    ? 'Payment processed successfully'
                    : `Payment status: ${charge.status}`
            };
        } catch (error: any) {
            console.error('[Stripe] Payment failed:', error);
            return {
                success: false,
                message: error.message || 'Stripe payment failed',
                transactionId: error.charge || undefined
            };
        }
    }

    async refund(transactionId: string, amount: number): Promise<RefundResult> {
        try {
            console.log(`[Stripe] Refunding payment_intent ${transactionId} amount ${amount}`);

            // Use payment_intent (not charge) — correct for Payment Intents API
            const refund = await stripe.refunds.create({
                payment_intent: transactionId,
                amount: Math.round(amount * 100),
            });

            return {
                success: refund.status === 'succeeded',
                refundId: refund.id,
                message: 'Refund processed successfully'
            };
        } catch (error: any) {
            console.error('[Stripe] Refund failed:', error);
            return {
                success: false,
                refundId: '',
                message: error.message || 'Stripe refund failed'
            };
        }
    }
}
