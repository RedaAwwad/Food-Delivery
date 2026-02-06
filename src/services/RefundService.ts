import { paymentAttemptService } from './PaymentAttemptService';
import { PaymentStrategyFactory } from './payment/PaymentStrategyFactory';
import { NotFoundError, InternalServerError } from '../utils/errors/error-factories';
import { CustomError } from '../utils/errors';
import { refundRepository } from '../repositories/RefundRepository';
import { orderService } from './order.service';

export class RefundService {
    async refundOrder(orderId: string) {
        // 1. Find the successful payment attempt for this order
        const attempt = await paymentAttemptService.findByOrderId(orderId);

        if (!attempt) {
            throw NotFoundError(`No successful payment found for order ${orderId}`);
        }

        // 2. Get the strategy for the provider
        const strategy = PaymentStrategyFactory.getStrategy(attempt.provider);

        // 3. Execute refund via strategy
        if (!attempt.transactionId) {
            throw InternalServerError("Payment attempt missing transaction ID, cannot refund");
        }

        try {
            const order = await orderService.findOrderById(orderId);
            if (!order) throw NotFoundError(`Order ${orderId} not found`);

            const result = await strategy.refund(attempt.transactionId, order.totalAmount);

            const refund = await refundRepository.create({
                orderId,
                paymentAttemptId: attempt.idempotencyKey,
                refundTransactionId: result.refundId,
                amount: order.totalAmount,
                status: result.success ? 'COMPLETED' : 'FAILED',
                provider: attempt.provider
            });
            return result;
        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw InternalServerError("Refund failed", error);
        }
    }
}

export const refundService = new RefundService();
