import { paymentMethodRepository } from '../repositories/PaymentMethodRepository';
import { Prisma } from '../generated/prisma/client';

export class PaymentMethodService {
    async create(data: Prisma.PaymentMethodCreateInput) {
        return paymentMethodRepository.create(data);
    }

    async findById(paymentMethodId: string) {
        return paymentMethodRepository.findById(paymentMethodId);
    }
}

export const paymentMethodService = new PaymentMethodService();
