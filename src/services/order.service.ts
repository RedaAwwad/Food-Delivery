import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { OrderStatus } from "../enums/orderStatus.enum";
import { OrderHandlerChainBuilder } from "../handlers/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";

class OrderService {
  async getAllOrders() {
    return await orderRepository.findAllOrders();
  }

  async getOrderById(orderId: string) {
    return orderRepository.findOrderById(orderId);
  }

  async updateOrderStatus(orderId: string, newOrderStatus: OrderStatus) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new CustomError({
        message: "The order not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    const updateOrder = await orderRepository.updateOrderStatus(orderId, newOrderStatus);
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
      // Execute the chain
      console.log(`\n========== Starting Order Processing ==========`);
      const result = await handlerChain.execute(context);
      console.log(`========== Order Processing Complete ==========\n`);

      // Return the final order
      if (!result.finalOrder) {
        throw new CustomError({
          message: "Order processing failed - no final order created",
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }

      return result.finalOrder;
    } catch (err: any) {
      // Ensure cart is unlocked even on error
      try {
        if (context.isCartLocked) {
          await cartRepository.unlockCart(customerId);
          console.log(`[OrderService] Cart unlocked after error`);
        }
      } catch (unlockError) {
        console.error(`[OrderService] Failed to unlock cart after error:`, unlockError);
      }

      // Re-throw custom errors, wrap others
      if (err instanceof CustomError) {
        throw err;
      }
      throw new CustomError({
        message: err.message || "Failed to place order",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}

export const orderService = new OrderService();
