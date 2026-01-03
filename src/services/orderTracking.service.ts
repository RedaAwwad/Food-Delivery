import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { OrderStatus } from "../enums/orderStatus.enum";
import { OrderHandlerChainBuilder } from "../handlers/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { orderTrackingRepository } from "../repositories/order-tracking.repository";
import { orderService } from "./order.service";

class OrderTrackingService {
    async getOrderTrackingStatus(orderId:string , customerId:string) {
      const order = await orderService.getOrderByOrderId(orderId);
      if (!order) {
         throw new CustomError({
          message:"the order is not found",
          statusCode:StatusCodes.NOT_FOUND})           
      }
      if (order.customerId !== customerId) {
         throw new CustomError({
          message:"the order is not belong to customer",
          statusCode:StatusCodes.CONFLICT
         })
      }
      return await orderTrackingRepository.getOrderTrackingStatus(orderId,customerId)
    }
}

export const orderTrackingService = new OrderTrackingService();
