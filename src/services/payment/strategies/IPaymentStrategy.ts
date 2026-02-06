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
