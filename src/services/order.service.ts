import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";

class OrderService {
  async getAllOrders() {
    return await orderRepository.findAllOrders();
  }

  async getOrderById(orderId: number) {
    return orderRepository.findOrderById(orderId);
  }

  async updateStatus(orderId: number, statusId: number) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new CustomError({
        message: "The order not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    const updateOrder = await orderRepository.updateStatus(orderId, statusId);
    return updateOrder;
  }

  async placeOrder(customerId: number, restaurantId: number) {
    try {
      const order = await orderRepository.createOrder(customerId, restaurantId);
      return order;
    } catch (err: any) {
      throw new CustomError({
        message: err.message || "Failed to place order",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
export const orderService = new OrderService();
