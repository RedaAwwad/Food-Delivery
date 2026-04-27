import { IPaymentStrategy, PaymentResult, RefundResult } from './IPaymentStrategy';
import stripe from '../../../utils/payment/stripe';

export class StripeStrategy implements IPaymentStrategy {
    /**
     * Creates a Stripe PaymentIntent.
     * - Embeds orderId in metadata so the webhook can locate the order.
     * - Uses idempotencyKey to prevent duplicate intents on retries.
     */
    async processPayment(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string; savedMethodData?: any },
        idempotencyKey: string
    ): Promise<PaymentResult> {
        console.log(`[Stripe] Processing payment for order ${metadata.orderId}, amount ${amount}`);

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
            success: true,
            transactionId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret!,
            requiresAction: true,
        };
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
