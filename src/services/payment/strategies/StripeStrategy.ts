import { IPaymentStrategy, PaymentResult, RefundResult } from './IPaymentStrategy';
import stripe from '../../../utils/payment/stripe';
import { BadRequestError } from '../../../utils/errors';

export class StripeStrategy implements IPaymentStrategy {
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

            const charge = await stripe.charges.create(params, {
                idempotencyKey: idempotencyKey
            });

            return {
                success: charge.status === 'succeeded',
                transactionId: charge.id,
                message: charge.status === 'succeeded' ? 'Payment processed successfully' : `Payment status: ${charge.status}`
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

    async refund(
        transactionId: string,
        amount: number
    ): Promise<RefundResult> {
        try {
            console.log(`[Stripe] Refunding transaction ${transactionId} amount ${amount}`);

            const refund = await stripe.refunds.create({
                charge: transactionId,
                amount: Math.round(amount * 100), // Convert to cents
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
