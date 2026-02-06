import { prisma } from '../config/prisma.config';
import { Prisma } from '../generated/prisma/client';

export class PaymentMethodRepository {
    async create(data: Prisma.PaymentMethodCreateInput) {
        return prisma.paymentMethod.create({ data });
    }

    async findById(paymentMethodId: string) {
        return prisma.paymentMethod.findUnique({
            where: { paymentMethodId }
        });
    }

    async findBySettingsId(preferredPaymentSettingsId: string) {
        return prisma.paymentMethod.findMany({
            where: { preferredPaymentSettingsId }
        });
    }
}

export const paymentMethodRepository = new PaymentMethodRepository();
