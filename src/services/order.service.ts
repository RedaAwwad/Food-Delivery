import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { prisma } from "../config/prisma.config";
import { restaurantRepository, RestaurantRepository } from "../repositories/restaurant.repository";
import { userRepository } from "../repositories/user.repository";

class OrderService {
  async getAllOrders() {
    return await orderRepository.findAllOrders();
  }

  async getOrderById(orderId: number) {
    return orderRepository.findOrderById(orderId);
  }

  async updateOrderStatus(
    orderId: number, 
    newStatusId: number, 
    userId : number , 
    userRole: string 
  ) {
    const userWithRestaurant = await userRepository.findUserWithRestaurant(userId , userRole)

  let restaurantId: number | null = null;

  if (userRole === "admin") {
    const adminRestaurant = await restaurantRepository.findRestaurantByUserId(userId)
    restaurantId = adminRestaurant?.id ?? null;
  } else if (userRole === "restaurant") {
    restaurantId = userWithRestaurant?.restaurant?.id ?? null;
  }

  if (!restaurantId) throw new CustomError({
    message:"No restaurant found", 
    statusCode:StatusCodes.NOT_FOUND});
  
  const updatedAt = new Date()
  const updatedOrder = await orderRepository.updateOrderStatus(
    orderId , restaurantId , newStatusId , userId , updatedAt
  )

  if (updatedOrder.count === 0) {
    throw new CustomError({
      message   : "Order does not belong to your restaurant",
      statusCode: StatusCodes.FORBIDDEN});
  }

  return updatedOrder;
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
