import { prisma } from "../config/prisma.config";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dto/order.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { PrismaTx } from "../types/prisma.types";
import { OrderStatusKey, PrismaClient } from "../generated/prisma/client";

class OrderRepository {
  async findAllCustomerOrdersByCustomerId(customerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!orders)
      throw NotFoundError("No Orders Found For This Customer")

    return orders
  }

  async findOrderByOrderIdAndCustomerId(orderId: string, customerId: string) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        orderId,
        customerId
      },
      include: {
        orderItems: true,
      }
    });
  }

  async findOrderById(orderId: string) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        orderId
      },
      include: {
        orderItems: true,
      }
    });
  }

  async updateOrderStatus(data: UpdateOrderStatusDto, tx: PrismaTx | PrismaClient = prisma) {
    const updatedStatus = await tx.order.update({
      where: { orderId: data.orderId },
      data: { orderStatus: data.newOrderStatus },
    });

    if (!updatedStatus) throw BadRequestError("Failed To Update Order")

    return updatedStatus
  }

  async cancelOrder(orderId: string) {
    try {
      return await prisma.order.update({
        where: { orderId },
        data: { orderStatus: OrderStatusKey.CANCELED },
      });

    } catch (error: any) {
      throw BadRequestError("Failed To Cancel Order", error)
    }
  }

  async createOrder(createOrderDto: CreateOrderDto, tx: PrismaTx | PrismaClient = prisma) {
    const { customerId, restaurantId, cartItems, orderStatus } = createOrderDto;
    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order and its items in a single transaction
    const newOrder = await tx.order.create({
      data: {
        customerId,
        restaurantId,
        totalAmount,
        orderStatus,
        orderItems: {
          create: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true, // Include items in the returned order object
      },
    });

    if (!newOrder) throw BadRequestError("Failed To Create Order")

    return newOrder;
  }
}
export const orderRepository = new OrderRepository();
