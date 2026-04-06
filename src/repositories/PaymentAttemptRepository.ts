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

    /**
     * Upserts a PENDING attempt keyed by idempotencyKey.
     * If a record already exists (retry after Stripe failure), it resets it to PENDING
     * and clears the old transactionId so a new PaymentIntent can be stored.
     */
    async upsertPendingAttempt(
        data: Prisma.PaymentAttemptUncheckedCreateInput,
        timestamp?: Date
    ): Promise<PaymentAttempt> {
        const baseData = {
            ...data,
            status: PaymentAttemptStatus.PENDING,
            transactionId: null,
            responseData: Prisma.JsonNull,
            ...(timestamp && { createdAt: timestamp, updatedAt: timestamp })
        };
        return prisma.paymentAttempt.upsert({
            where: { idempotencyKey: data.idempotencyKey },
            create: baseData,
            update: {
                status: PaymentAttemptStatus.PENDING,
                transactionId: null,
                responseData: Prisma.JsonNull,
                ...(timestamp && { updatedAt: timestamp })
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
