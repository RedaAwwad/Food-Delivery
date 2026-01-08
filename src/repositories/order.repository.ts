import { prisma } from "../config/prisma.config";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dto/order.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";

class OrderRepository {
  async findAllOrdersByCustomerId(customerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!orders)
      throw NotFoundError("No Orders Found For This Customer")

    return orders
  }

  async findOrderById(orderId: string) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        orderId
      },
    });
  }

  async updateOrderStatus(data: UpdateOrderStatusDto) {
    const updatedStatus = await prisma.order.update({
      where: { orderId: data.orderId },
      data: { orderStatus: data.newOrderStatus },
    });

    if (!updatedStatus)
      throw BadRequestError("Failed To Update Order")

    return updatedStatus
  }

  async cancelOrder(orderId: string) {
    try {
      return await prisma.order.update({
        where: { orderId },
        data: { orderStatus: "canceled" },
      });

    } catch (error: any) {
      throw BadRequestError("Failed To Cancel Order", error)
    }
  }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { customerId, restaurantId, cartItems, status } = createOrderDto;
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
        orderStatus: status,
        createdById: customerId,
        updatedById: customerId,
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

    if(!newOrder)
      throw BadRequestError("Failed To Create Order")

    return newOrder;
  }
}
export const orderRepository = new OrderRepository();
