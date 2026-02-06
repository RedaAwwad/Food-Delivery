import { Prisma, PaymentAttempt, PaymentAttemptStatus } from '../generated/prisma/client';
import { prisma } from '../config/prisma.config';

export class PaymentAttemptRepository {
    async create(
        data: Prisma.PaymentAttemptUncheckedCreateInput,
        timestamp?: Date
    ): Promise<PaymentAttempt> {
        return prisma.paymentAttempt.create({
            data: {
                ...data,
                ...(timestamp && { createdAt: timestamp, updatedAt: timestamp })
            }
        });
    }

    async findByIdempotencyKey(key: string): Promise<PaymentAttempt | null> {
        return prisma.paymentAttempt.findUnique({ where: { idempotencyKey: key } });
    }

    async updateStatus(
        key: string,
        status: PaymentAttemptStatus,
        transactionId?: string,
        responseData?: any,
        timestamp?: Date
    ): Promise<PaymentAttempt> {
        return prisma.paymentAttempt.update({
            where: { idempotencyKey: key },
            data: {
                status,
                ...(transactionId !== undefined && { transactionId }),
                ...(responseData !== undefined && { responseData }),
                ...(timestamp && { updatedAt: timestamp })
            }
        });
    }

    async updateOrderId(key: string, orderId: string): Promise<PaymentAttempt> {
        return prisma.paymentAttempt.update({
            where: { idempotencyKey: key },
            data: { orderId }
        });
    }

    async findByOrderId(orderId: string): Promise<PaymentAttempt | null> {
        return prisma.paymentAttempt.findFirst({
            where: {
                orderId,
                status: PaymentAttemptStatus.SUCCESS
            }
        });
    }
}

export const paymentAttemptRepository = new PaymentAttemptRepository();
