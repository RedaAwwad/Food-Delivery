import { UpdateOrderTrackingStatusDto } from "../dto/orderTrackingStatus.dto";
import { orderTrackingRepository } from "../repositories/order-tracking.repository";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import { orderService } from "./order.service";
import { paymentService } from "./PaymentService";

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

    // If restaurant marks as PREPARING → trigger payment capture.
    // This MUST succeed before the status update proceeds.
    // If capture fails, the request errors out and the restaurant can retry.
    if (updateDto.orderStatusKey === 'PREPARING') {
      await paymentService.capturePayment(updateDto.orderId);
    }

    return await orderTrackingRepository.appendOrderTrackingStatus(
      updateDto.orderId,
      updateDto.customerId,
      updateDto.orderStatusKey,
      updateDto.managerId
    );
  }
}


export const orderTrackingService = new OrderTrackingService();