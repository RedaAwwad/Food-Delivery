import { prisma } from "../config/prisma.config";
import { orderRepository } from "../repositories/order.repository";
import { OrderHandlerChainBuilder } from "../handlers/order/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { InternalServerError, NotFoundError } from "../utils/errors";
import { UpdateOrderStatusDto } from "../dto/order.dto";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "@prisma/client/extension";

class OrderService {
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

    const updateOrder = await orderRepository.cancelOrder(orderId);
    return updateOrder;
  }

  async placeOrder(customerId: string, restaurantId: string) {
    const handlerChain = OrderHandlerChainBuilder.build();

    try {
      // Execute the chain within a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Initialize the context with the transaction client
        const context: OrderContext = {
          customerId,
          restaurantId,
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

      return result.finalOrder;
    } catch (err: any) {
      throw InternalServerError("Failed to place order", err);
    }
  }

}

export const orderService = new OrderService();
