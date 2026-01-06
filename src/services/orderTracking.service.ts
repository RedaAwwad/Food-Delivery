import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { cartRepository } from "../repositories/cart.repository";
import { OrderStatus } from "../enums/orderStatus.enum";
import { OrderHandlerChainBuilder } from "../handlers/OrderHandlerChainBuilder";
import { OrderContext } from "../types/OrderContext";
import { orderTrackingRepository } from "../repositories/order-tracking.repository";
import { orderService } from "./order.service";
import { TrackingStatusStep, UpdateOrderTrackingStatusDto } from "../dto/orderTrackingStatus.dto";
import { JsonArray, JsonObject } from "@prisma/client/runtime/library";
import { prisma } from '../config/prisma.config';
import { Prisma } from "../generated/prisma";

class OrderTrackingService {
  async getOrderTrackingStatus(orderId: string, customerId: string) {
    const order = await orderService.getOrderByOrderId(orderId);
    if (!order) {
      throw new CustomError({
        message: "the order is not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    if (order.customerId !== customerId) {
      throw new CustomError({
        message: "You are not authorized to view this order",
        statusCode: StatusCodes.FORBIDDEN,
      });
    }
    return await orderTrackingRepository.getOrderTrackingStatus(orderId, customerId);
  }

  async updateOrderTrackingStatus(prisma:Prisma.TransactionClient, updateDto: UpdateOrderTrackingStatusDto) {
  const orderTrackingStatus = await this.getOrderTrackingStatus(
    updateDto.orderId,
    updateDto.customerId
  );

  if (!orderTrackingStatus) {
    throw new CustomError({
      message: "The order tracking status is not found",
      statusCode: StatusCodes.NOT_FOUND,
    });
  }

  // convert JsonValue to array && add to json
  const trackingStatus = (orderTrackingStatus.trackingStatus as unknown as TrackingStatusStep []) ?? []
  if (trackingStatus.at(-1)?.orderStatusKey ===  updateDto.orderStatusKey ) {
    return orderTrackingStatus
  }
  trackingStatus.push({
    orderStatusKey: updateDto.orderStatusKey as TrackingStatusStep['orderStatusKey'],
    updatedAt: new Date(),
    updatedBy: updateDto.managerId, 
  });

  return await orderTrackingRepository.updateOrderTrackingStatus(
    prisma,
    updateDto.orderId, 
    updateDto.customerId,
    trackingStatus
  )
 }
}


export const orderTrackingService = new OrderTrackingService();
