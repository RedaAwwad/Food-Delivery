import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { OrderStatus } from "../enums/orderStatus.enum";
import { OrderHandlerChainBuilder } from "../handlers/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { orderTrackingService } from "./orderTracking.service";
import { restaurantService } from "./restaurant.service";
import { prisma } from "../config/prisma.config";

class OrderService {
  async getAllOrders() {
    return await orderRepository.findAllOrders();
  }

  async getOrderByOrderId(orderId: string) {
    return orderRepository.findOrderById(orderId);
  }

async updateOrderStatusByRestaurant(orderId: string, managerId:string , orderStatusKey: OrderStatus) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new CustomError({
        message: "The order is not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    const restaurant = await restaurantService.findRestaurantByManagerId(managerId)
    if (!restaurant || restaurant.restaurantId !== order.restaurantId){
      throw new CustomError({
        message:'The restaurant is not found Or the restaurant is not belong to Order',
        statusCode:StatusCodes.CONFLICT
      })
    }
    const customerId = order.customerId

    // updateOrder
    await prisma.$transaction(async (tx) => {
    const updateOrder = await orderRepository.updateOrderStatusByRestaurant(tx, {orderId, managerId , orderStatusKey});
    // upsert Order Trackig Status
    await orderTrackingService.updateOrderTrackingStatus(tx , {orderId , managerId, customerId ,orderStatusKey } )    
    return updateOrder;
    }) 
    
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
