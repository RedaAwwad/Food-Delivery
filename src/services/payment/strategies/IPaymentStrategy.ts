export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    message?: string;
    clientSecret?: string;
    requiresAction?: boolean;
}

export interface RefundResult {
    success: boolean;
    refundId: string;
    message?: string;
}

export interface CaptureResult {
    success: boolean;
    message?: string;
}

export interface IPaymentStrategy {
    processPayment(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string; savedMethodData?: any },
        idempotencyKey: string
    ): Promise<PaymentResult>;

    capturePayment(transactionId: string, amount?: number): Promise<CaptureResult>;

    refund(transactionId: string, amount: number): Promise<RefundResult>;
}
