import { IPaymentStrategy, PaymentResult, RefundResult } from './IPaymentStrategy';

export class AmadeusStrategy implements IPaymentStrategy {
    async process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult> {
        console.log(`[Amadeus] Processing payment of ${amount} with key ${idempotencyKey}`);
        return {
            success: true,
            transactionId: `amadeus_${Date.now()}`,
            message: 'Payment processed successfully via Amadeus'
        };
    }

    async refund(
        transactionId: string,
        amount: number
    ): Promise<RefundResult> {
        console.log(`[Amadeus] Refunding transaction ${transactionId}`);
        return {
            success: true,
            refundId: `ref_amadeus_${Date.now()}`,
            message: 'Refund successful'
        };
    }
}
