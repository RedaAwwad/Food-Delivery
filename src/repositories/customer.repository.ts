import { prisma } from "../config/prisma.config";

export class CustomerRepository {
  async findCustomerOrders(customerId: number) {
    return await prisma.order.findMany({
      where: { customerId },
      select: {
        id: true,
        totalAmount: true,
        orderStatus: {
          select: {
            id: true,
            name: true,
            // key: true,
          },
        },
      },
    });
  }

  async findCustomerOrderByCustomerId(customerId: number, orderId: number) {
    return await prisma.order.findFirst({
      where: { id: orderId, customerId },
      select: {
        id: true,
        totalAmount: true,
        orderStatus: {
          select: {
            id: true,
            name: true,
            // key: true,
          },
        },
      },
    });
  }

  async getCustomerByCustomerId(customerId: number) {
    return prisma.customer.findUnique({
      where: { id: customerId },
    });
  }
  async updateDeactivateAccount(customerId: number) {
    return await prisma.customer.update({
      where: { id: customerId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    });
  }
}
export const customerRepository = new CustomerRepository();
