import { prisma } from "../config/prisma.config";
import { orderRepository } from "../repositories/order.repository";
import { OrderHandlerChainBuilder } from "../handlers/order/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { InternalServerError, NotFoundError, CustomError } from "../utils/errors";
import { UpdateOrderStatusDto } from "../dto/order.dto";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "@prisma/client/extension";
import { paymentAttemptService } from "./PaymentAttemptService";
import { PaymentAttemptStatus } from '../generated/prisma/client';
import { ConflictError } from "../utils/errors/error-factories";
import { refundService } from "./RefundService";

class OrderService {
  private async createPendingAttempt(
    idempotencyKey: string,
    requestTimestamp: Date
  ): Promise<void> {
    await paymentAttemptService.createPendingAttempt(
      idempotencyKey,
      null,  // orderId is null initially, set after order creation
      'UNKNOWN',
      requestTimestamp
    );
  }

  private async handleIdempotencyCheck(
    idempotencyKey: string,
    requestTimestamp: Date
  ): Promise<{ shouldProceed: boolean; existingOrder?: any }> {
    const existingAttempt = await paymentAttemptService.findAttempt(idempotencyKey);

    if (!existingAttempt) {
      return { shouldProceed: true };
    }

    // Already successful - return existing order
    if (existingAttempt.status === PaymentAttemptStatus.SUCCESS) {
      const order = await orderRepository.findOrderById(existingAttempt.orderId!);
      return { shouldProceed: false, existingOrder: order! };
    }

    // Check for stale PENDING
    if (existingAttempt.status === PaymentAttemptStatus.PENDING) {
      const ageMinutes = (Date.now() - existingAttempt.createdAt.getTime()) / 60000;
      if (ageMinutes > 5) {
        await paymentAttemptService.finalizeAttempt(
          idempotencyKey, false, '',
          { error: 'Timeout' },
          requestTimestamp
        );
        return { shouldProceed: true };
      } else {
        throw ConflictError("Order placement in progress");
      }
    }

    // If FAILED, allow retry
    return { shouldProceed: true };
  }

  private async finalizeSuccessfulAttempt(
    idempotencyKey: string,
    result: any,
    requestTimestamp: Date
  ): Promise<void> {
    await paymentAttemptService.finalizeAttempt(
      idempotencyKey,
      true,
      result.paymentResult?.transactionId || '',
      { orderId: result.finalOrder.orderId, ...result.paymentResult },
      requestTimestamp
    );
  }
  async findAllCustomerOrdersByCustomerId(customerId: string) {
    return await orderRepository.findAllCustomerOrdersByCustomerId(customerId);
  }

  async findOrderByOrderIdAndCustomerId(orderId: string, customerId: string) {
    return await orderRepository.findOrderByOrderIdAndCustomerId(orderId, customerId);
  }

  async findOrderById(orderId: string) {
    return orderRepository.findOrderById(orderId);
  }

  async updateOrderStatus(data: UpdateOrderStatusDto, tx: PrismaTx | PrismaClient = prisma) {
    // const order = await orderRepository.findOrderById(data.orderId);

    // if (!order) throw NotFoundError("The order not found");

    const updateOrder = await orderRepository.updateOrderStatus(data, tx);
    return updateOrder;
  }

  async cancelOrder(orderId: string) {
    const order = await orderRepository.findOrderById(orderId);

    if (!order)
      throw NotFoundError("The order not found");

    // Process refund before cancelling
    try {
      await refundService.refundOrder(orderId);
    } catch (error) {
      console.error(`Refund failed for order ${orderId}`, error);
      // We might want to block cancellation or flag it? 
      // For now, logged error but strictly speaking, cancellation should probably proceed 
      // or be flagged as "CANCELLED_REFUND_FAILED" if we had that status.
      // Let's assume we proceed but log it.
    }

    const updateOrder = await orderRepository.cancelOrder(orderId);
    return updateOrder;
  }

  async placeOrder(customerId: string, restaurantId: string) {
    const requestTimestamp = new Date(); // Consistent timestamp for all operations
    const idempotencyKey = `cart_${customerId}_${restaurantId}`;

    // 1. Idempotency Check (Pre-Transaction)
    const { shouldProceed, existingOrder } = await this.handleIdempotencyCheck(
      idempotencyKey,
      requestTimestamp
    );

    if (!shouldProceed) {
      return existingOrder; // Idempotent return
    }

    // 2. Create PENDING Attempt (Pre-Transaction)
    await this.createPendingAttempt(idempotencyKey, requestTimestamp);

    try {
      const handlerChain = OrderHandlerChainBuilder.build();

      // 3. Execute Transaction
      const result = await prisma.$transaction(async (tx) => {
        const context: OrderContext = {
          customerId,
          restaurantId,
          requestTimestamp, // Add generic timestamp to context
          tx,
        };

        const chainResult = await handlerChain.execute(context);
        return chainResult;
      }, {
        maxWait: 5000,
        timeout: 20000,
      });

      if (!result.finalOrder) {
        throw InternalServerError("Failed to place order");
      }

      await paymentAttemptService.updateOrderId(
        idempotencyKey,
        result.finalOrder.orderId
      );

      // 4. Finalize Success (Post-Transaction)
      await this.finalizeSuccessfulAttempt(
        idempotencyKey,
        result,
        requestTimestamp
      );

      return result.finalOrder;

    } catch (err: any) {
      // 5. Handle Failure (Post-Transaction)
      await paymentAttemptService.finalizeAttempt(
        idempotencyKey,
        false,
        '',
        { error: err.message },
        requestTimestamp
      );

      if (err instanceof CustomError) {
        throw err;
      }
      throw InternalServerError("Failed to place order", err);
    }
  }

}

export const orderService = new OrderService();
