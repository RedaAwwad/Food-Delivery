import { TrackingStatusStep, UpdateOrderTrackingStatusDto } from "../dto/orderTrackingStatus.dto";
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
    const orderTrackingStatus = await this.getOrderTrackingStatus(
      updateDto.orderId,
      updateDto.customerId
    );

    if (!orderTrackingStatus) throw NotFoundError("Order Tracking Status Not Found")

    // convert JsonValue to array && add to json
    const trackingStatus = (orderTrackingStatus.trackingStatus as unknown as TrackingStatusStep[]) ?? []
    if (trackingStatus.at(-1)?.orderStatusKey === updateDto.orderStatusKey) {
      return orderTrackingStatus
    }
    trackingStatus.push({
      orderStatusKey: updateDto.orderStatusKey as TrackingStatusStep['orderStatusKey'],
      updatedAt: new Date(),
      updatedBy: updateDto.managerId,
    });

    return await orderTrackingRepository.updateOrderTrackingStatus(
      updateDto.orderId,
      updateDto.customerId,
      trackingStatus
    )
  }
}


export const orderTrackingService = new OrderTrackingService();
