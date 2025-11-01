import { prisma } from "../config/prisma.config";

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
}
export const orderRepository = new OrderRepository();
