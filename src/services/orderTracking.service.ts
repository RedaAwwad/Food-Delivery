import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { OrderStatus } from "../enums/orderStatus.enum";
import { OrderHandlerChainBuilder } from "../handlers/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { orderTrackingRepository } from "../repositories/order-tracking.repository";

class OrderTrackingService {
    async getOrderTrackingHistory(orderId:string) {
      return await orderTrackingRepository.getOrderTrackingHistory(orderId)
    }
}

export const orderTrackingService = new OrderTrackingService();
