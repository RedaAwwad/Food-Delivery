import { prisma } from '../config/prisma.config';
import { Prisma, Refund } from '../generated/prisma/client';

export class RefundRepository {
    async create(data: Prisma.RefundUncheckedCreateInput): Promise<Refund> {
        return prisma.refund.create({
            data
        });
    }

    async findByRefundId(refundId: string): Promise<Refund | null> {
        return prisma.refund.findUnique({
            where: { refundId }
        });
    }
}

export const refundRepository = new RefundRepository();
