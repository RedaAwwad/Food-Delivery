import { IPaymentStrategy, PaymentResult, RefundResult, CaptureResult } from './IPaymentStrategy';

export class AmadeusStrategy implements IPaymentStrategy {
    async processPayment(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string; savedMethodData?: any },
        idempotencyKey: string
    ): Promise<PaymentResult> {
        console.log(`[Amadeus] Processing payment of ${amount} with key ${idempotencyKey}`);
        return {
            success: true,
            transactionId: `amadeus_${Date.now()}`,
            message: 'Payment processed successfully via Amadeus',
            requiresAction: true,
            clientSecret: '' // Placeholder for actual Amadeus action
        };
    }

    async capturePayment(transactionId: string, amount?: number): Promise<CaptureResult> {
        console.log(`[Amadeus] Capture request for ${transactionId} (No-op stub)`);
        return { success: true, message: 'Amadeus capture stub' };
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
