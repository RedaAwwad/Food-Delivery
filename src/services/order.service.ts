import { orderRepository } from "../repositories/order.repository";
import { cartService } from "./cart.service";
import { OrderHandlerChainBuilder } from "../handlers/order/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { InternalServerError, NotFoundError } from "../utils/errors";
import { UpdateOrderStatusDto } from "../dto/order.dto";

class OrderService {
  async findAllOrdersByCustomerId(customerId: string) {
    return await orderRepository.findAllOrdersByCustomerId(customerId);
  }

  async findOrderById(orderId: string) {
    return orderRepository.findOrderById(orderId);
  }

  async updateOrderStatus(data: UpdateOrderStatusDto) {
    const order = await orderRepository.findOrderById(data.orderId);

    if (!order)
      throw NotFoundError("The order not found");

    const updateOrder = await orderRepository.updateOrderStatus(data);
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
    // Build the handler chain
    const handlerChain = OrderHandlerChainBuilder.build();

    // Initialize the context
    const context: OrderContext = {
      customerId,
      restaurantId,
    };

    try {
      const result = await handlerChain.execute(context);

      if (!result.finalOrder) {
        throw InternalServerError("Failed to place order");
      }

      return result.finalOrder;
    } catch (err: any) {
      try {
        if (context.isCartLocked)
          await cartService.unlockCart(customerId);

      } catch (unlockError: any) {
        throw InternalServerError(`[OrderService] Failed to unlock cart after error:`, unlockError);
      }

      throw InternalServerError("Failed to place order", err);
    }
  }

}

export const orderService = new OrderService();
