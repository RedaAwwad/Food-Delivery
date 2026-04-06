export interface PaymentIntentResult {
    clientSecret: string;
    paymentIntentId: string;
    syncSuccess?: boolean;
}

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
    /**
     * Async webhook flow — Stripe, PayPal.
     * Creates a PaymentIntent and returns a clientSecret for the frontend to complete.
     */
    createPaymentIntent(
        amount: number,
        metadata: { orderId: string; customerId: string; restaurantId: string; email: string; savedMethodData?: any },
        idempotencyKey: string
    ): Promise<PaymentIntentResult>;

    /**
     * Synchronous flow — Cash on Delivery, direct charge fallback.
     */
    process(
        amount: number,
        metadata: any,
        idempotencyKey: string
    ): Promise<PaymentResult>;

    refund(transactionId: string, amount: number): Promise<RefundResult>;
}
