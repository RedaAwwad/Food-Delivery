import { UpdateOrderTrackingStatusDto } from "../dto/orderTrackingStatus.dto";
import { orderTrackingRepository } from "../repositories/order-tracking.repository";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import { orderService } from "./order.service";

class OrderTrackingService {
  async getOrderTrackingStatus(orderId: string, customerId: string) {
    const order = await orderService.findOrderById(orderId);
    if (!order) throw NotFoundError("Order Not Found")

    if (order.customerId !== customerId) throw ForbiddenError("You are not authorized to view this order")

    return await orderTrackingRepository.getOrderTrackingStatus(orderId, customerId);
  }

  async updateOrderTrackingStatus(updateDto: UpdateOrderTrackingStatusDto) {
    // Check if order exists and customer is authorized
    await this.getOrderTrackingStatus(
      updateDto.orderId,
      updateDto.customerId
    );

    return await orderTrackingRepository.appendOrderTrackingStatus(
      updateDto.orderId,
      updateDto.customerId,
      updateDto.orderStatusKey,
      updateDto.managerId
    );
  }
}


export const orderTrackingService = new OrderTrackingService();