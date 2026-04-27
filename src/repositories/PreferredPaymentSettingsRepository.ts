import { prisma } from '../config/prisma.config';

export class PreferredPaymentSettingsRepository {
    async findByCustomerId(customerId: string) {
        return prisma.preferredPaymentSettings.findUnique({
            where: { customerId },
            include: { paymentMethods: true }
        });
    }

    async create(customerId: string, paymentMethodId: string) {
        return prisma.preferredPaymentSettings.create({
            data: {
                customerId,
                paymentMethodId
            }
        });
    }
}

export const preferredPaymentSettingsRepository = new PreferredPaymentSettingsRepository();
