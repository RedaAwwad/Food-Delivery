import { prisma } from "../config/prisma.config";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { CartItem, MenuItem, OrderStatus } from "@prisma-client";

type CartItemWithMenuItem = CartItem & { menuItem: MenuItem };

type CreateOrderPayload = {
  customerId: number;
  restaurantId: number;
  cartItems: CartItemWithMenuItem[];
  status: OrderStatus;
};

class OrderRepository {
  async findAllOrders() {
    return await prisma.order.findMany();
  }

  async findOrderById(orderId: number) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        id: orderId,
      },
    });
  }

  async updateStatus(orderId: number, statusId: number) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { orderStatusId: statusId },
    });
  }
  async createOrder(payload: CreateOrderPayload) {
    const { customerId, restaurantId, cartItems, status } = payload;
    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order and its items in a single transaction
    const newOrder = await prisma.order.create({
      data: {
        customerId,
        restaurantId,
        totalAmount,
        status,
        items: {
          create: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true, // Include items in the returned order object
      },
    });

    return newOrder;
  }
}
export const orderRepository = new OrderRepository();
