import { PaymentAttemptStatus } from '../generated/prisma/client';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';

export class PaymentAttemptService {
    async findAttempt(key: string) {
        return paymentAttemptRepository.findByIdempotencyKey(key);
    }

    async findByOrderId(orderId: string) {
        return paymentAttemptRepository.findByOrderId(orderId);
    }

    async createPendingAttempt(
        key: string,
        orderId: string | null,
        provider: string,
        timestamp?: Date
    ) {
        return paymentAttemptRepository.create({
            idempotencyKey: key,
            orderId,
            status: PaymentAttemptStatus.PENDING,
            provider
        }, timestamp);
    }

    /**
     * Idempotent version of createPendingAttempt.
     * Use this in PaymentService where a retry after a Stripe failure must
     * reset the attempt without crashing on a duplicate key.
     */
    async upsertPendingAttempt(
        key: string,
        orderId: string | null,
        provider: string,
        timestamp?: Date
    ) {
        return paymentAttemptRepository.upsertPendingAttempt({
            idempotencyKey: key,
            orderId,
            status: PaymentAttemptStatus.PENDING,
            provider
        }, timestamp);
    }

    async finalizeAttempt(
        key: string,
        success: boolean,
        transactionId: string,
        data: any,
        timestamp?: Date
    ) {
        const status = success ? PaymentAttemptStatus.SUCCESS : PaymentAttemptStatus.FAILED;
        return this.updateStatus(key, status, transactionId, data, timestamp);
    }

    async updateStatus(
        key: string,
        status: PaymentAttemptStatus,
        transactionId?: string,
        data: any = {},
        timestamp?: Date
    ) {
        return paymentAttemptRepository.updateStatus(key, status, transactionId, data, timestamp);
    }

    async updateOrderId(key: string, orderId: string) {
        return paymentAttemptRepository.updateOrderId(key, orderId);
    }
}

export const paymentAttemptService = new PaymentAttemptService();
