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

    async finalizeAttempt(
        key: string,
        success: boolean,
        transactionId: string,
        data: any,
        timestamp?: Date
    ) {
        const status = success ? PaymentAttemptStatus.SUCCESS : PaymentAttemptStatus.FAILED;
        return paymentAttemptRepository.updateStatus(key, status, transactionId, data, timestamp);
    }

    async updateOrderId(key: string, orderId: string) {
        return paymentAttemptRepository.updateOrderId(key, orderId);
    }
}

export const paymentAttemptService = new PaymentAttemptService();
