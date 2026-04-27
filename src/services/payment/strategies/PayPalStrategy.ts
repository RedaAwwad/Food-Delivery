import { IPaymentStrategy, PaymentResult, RefundResult } from './IPaymentStrategy';

export class PayPalStrategy implements IPaymentStrategy {
    async processPayment(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string; savedMethodData?: any },
        idempotencyKey: string
    ): Promise<PaymentResult> {
        console.log(`[PayPal] Processing payment of ${amount} with key ${idempotencyKey}`);
        return {
            success: true,
            transactionId: `paypal_${Date.now()}`,
            message: 'Payment processed successfully via PayPal',
            requiresAction: true,
            clientSecret: '' // Placeholder for actual PayPal approval URL or similar
        };
    }

    async refund(
        transactionId: string,
        amount: number
    ): Promise<RefundResult> {
        console.log(`[PayPal] Refunding transaction ${transactionId}`);
        return {
            success: true,
            refundId: `ref_paypal_${Date.now()}`,
            message: 'Refund successful'
        };
    }
}
