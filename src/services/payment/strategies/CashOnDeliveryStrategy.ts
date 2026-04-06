import { IPaymentStrategy, PaymentIntentResult, PaymentResult, RefundResult } from './IPaymentStrategy';

export class CashOnDeliveryStrategy implements IPaymentStrategy {
    async createPaymentIntent(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string },
        idempotencyKey: string
    ): Promise<PaymentIntentResult> {
        return {
            clientSecret: '',
            paymentIntentId: '',
            syncSuccess: true
        };
    }

    async process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult> {
        console.log(`[COD] Processing payment of ${amount}`);
        // COD is always successful immediately as it's a promise to pay
        return {
            success: true,
            transactionId: `cod_${Date.now()}`,
            message: 'Cash on delivery confirmed'
        };
    }

    async refund(
        transactionId: string,
        amount: number
    ): Promise<RefundResult> {
        console.log(`[COD] Refund request for ${transactionId} (No-op)`);
        // Refund for COD is a manual process or simply not collecting cash
        return {
            success: true,
            refundId: `ref_cod_${Date.now()}`,
            message: 'COD refund logged (manual action required)'
        };
    }
}
