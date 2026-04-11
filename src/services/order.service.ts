import { prisma } from "../config/prisma.config";
import { orderRepository } from "../repositories/order.repository";
import { OrderHandlerChainBuilder } from "../handlers/order/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { UpdateOrderStatusDto } from "../dto/order.dto";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "@prisma/client/extension";
import { paymentAttemptService } from "./PaymentAttemptService";
import { PaymentAttemptStatus } from '../generated/prisma/client';
import { refundService } from "./RefundService";
import { menuItemService } from "./menuItem.service";
import { OrderStatusKey } from "../generated/prisma/client";
import { InternalServerError, NotFoundError, BadRequestError, ForbiddenError, ConflictError, CustomError } from "../utils/errors";

class OrderService {
  private async createPendingAttempt(idempotencyKey: string, timestamp: Date): Promise<void> {
    try {
      // Use upsert so a FAILED or stale attempt from a previous placeOrder call
      // can be reset to PENDING without hitting a unique-key constraint (P2002).
      // The race-condition guard is handleIdempotencyCheck(), which runs before this
      // and throws ConflictError if a truly active PENDING attempt exists.
      await paymentAttemptService.upsertPendingAttempt(idempotencyKey, null, 'UNKNOWN', timestamp);
    } catch (err: any) {
      throw err;
    }
  }


  private async handleIdempotencyCheck(
    idempotencyKey: string,
    requestTimestamp: Date
  ): Promise<{ shouldProceed: boolean; existingOrder?: any }> {
    const existingAttempt = await paymentAttemptService.findAttempt(idempotencyKey);

    if (!existingAttempt) {
      return { shouldProceed: true };
    }

    if (existingAttempt.status === PaymentAttemptStatus.SUCCESS) {
      const ageSeconds = (Date.now() - existingAttempt.updatedAt.getTime()) / 1000;
      if (ageSeconds < 60) {
        // Recent success = same request retried (network drop etc.) → return existing order
        const order = await orderRepository.findOrderById(existingAttempt.orderId!);
        return { shouldProceed: false, existingOrder: order! };
      }
    }

    // Check for stale PENDING
    if (existingAttempt.status === PaymentAttemptStatus.PENDING) {
      const ageMinutes = (Date.now() - existingAttempt.createdAt.getTime()) / 60000;
      if (ageMinutes > 5) {
        await paymentAttemptService.finalizeAttempt(
          idempotencyKey,
          false,
          '',
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
    const updateOrder = await orderRepository.updateOrderStatus(data, tx);
    return updateOrder;
  }

  async cancelOrder(orderId: string, customerId: string) {
    const order = await orderRepository.findOrderById(orderId);

    if (!order) throw NotFoundError("Order not found");
    if (order.customerId !== customerId) throw ForbiddenError("Not your order");
    if (order.orderStatus === OrderStatusKey.COMPLETED) throw BadRequestError("Cannot cancel delivered order");

    // 1. Process refund
    await refundService.refundOrder(orderId);

    // 2. Update order status
    await orderRepository.updateOrderStatus({
      orderId,
      newOrderStatus: OrderStatusKey.CANCELED
    });

    // 3. Restore inventory
    await menuItemService.restoreStock(orderId);

    return { message: "Order cancelled and refund processed" };
  }

  private async executeOrderTransaction(
    customerId: string,
    restaurantId: string,
    customerEmail: string,
    paymentProvider: string | undefined,
    paymentMethodId: string | undefined,
    requestTimestamp: Date
  ): Promise<OrderContext> {
    const creationChain = OrderHandlerChainBuilder.buildOrderTransactionChain();

    return await prisma.$transaction(async (tx) => {
      const context: OrderContext = {
        customerId,
        restaurantId,
        customerEmail,
        paymentProvider,
        paymentMethodId,
        requestTimestamp,
        tx,
      };

      const chainResult = await creationChain.execute(context);
      return chainResult as OrderContext;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });
  }

  private async processPaymentAndFinalize(
    resultContext: OrderContext,
    idempotencyKey: string,
    requestTimestamp: Date
  ) {
    await paymentAttemptService.updateOrderId(
      idempotencyKey,
      resultContext.order!.orderId
    );

    // Phase B: External API Call (Outside Transaction)
    // safe even if Stripe fails, PENDING order is committed above.
    const postCreationChain = OrderHandlerChainBuilder.buildPaymentProcessingChain();
    
    // Remove tx from context to ensure it can't be used outside block
    const safeContext = { ...resultContext };
    delete safeContext.tx;

    await postCreationChain.execute(safeContext);

    // 5. Finalize Success (Post-Payment API)
    if (safeContext.paymentResult?.success === true) {
        await this.finalizeSuccessfulAttempt(
          idempotencyKey,
          { finalOrder: safeContext.order, paymentResult: safeContext.paymentResult },
          requestTimestamp
        );
    }

    return {
      order: safeContext.order,
      clientSecret: safeContext.clientSecret ?? null,
    };
  }

  async placeOrder(
    customerId: string, 
    restaurantId: string, 
    customerEmail: string,
    paymentProvider?: string,
    paymentMethodId?: string
  ) {
    const requestTimestamp = new Date();
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

    let resultContext: OrderContext;

    try {
      // 3. Execute Transaction (Phase A)
      resultContext = await this.executeOrderTransaction(
        customerId, restaurantId, customerEmail, paymentProvider, paymentMethodId, requestTimestamp
      );

      if (!resultContext.order) {
        throw InternalServerError("Failed to place order");
      }

    } catch (err: any) {
      // 4. Handle Failure in Order Creation
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

    try {
      // Phase B: External API Call (Outside Transaction)
      return await this.processPaymentAndFinalize(resultContext, idempotencyKey, requestTimestamp);

    } catch (err: any) {
      // 6. Handle Failure in Payment Initiation (Network drop, Stripe down)
      console.error(`[OrderService] Stripe API failed for order ${resultContext.order.orderId}:`, err);
      
      // Order is saved as PENDING, but payment initialization failed.
      // E-commerce standard: Return the order so user doesn't lose it, return no clientSecret.
      await paymentAttemptService.finalizeAttempt(
        idempotencyKey,
        false,
        '',
        { error: err.message, status: 'api_failed' },
        requestTimestamp
      );

      return {
        order: resultContext.order,
        clientSecret: null,
      };
    }
  }
}

export const orderService = new OrderService();
