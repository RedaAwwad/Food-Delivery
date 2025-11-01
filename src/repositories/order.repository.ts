import { prisma } from "../config/prisma.config";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";


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

  async createOrder(customerId: number, restaurantId: number) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: true,
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      throw new CustomError({
        message: "Cart is empty",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }


    // Calculate total
    const totalAmount = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const pendingStatus = await prisma.orderStatus.findFirst({
      where: { name: "Pending" },
    });

    if (!pendingStatus) {
      throw new Error("OrderStatus 'Pending' not found");
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId,
          restaurantId,
          totalAmount,
          orderStatusId: pendingStatus.id,
        },
      });

      await tx.orderItem.createMany({
        data: cart.cartItems.map((item) => ({
          orderId: newOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return order;
  }
}
export const orderRepository = new OrderRepository();
