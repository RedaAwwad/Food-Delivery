import { prisma } from "../config/prisma.config";
import { restaurantRepository } from "./restaurant.repository";

export class CustomerRepository {
  async findCustomerOrders(customerId: string) {
    return await prisma.order.findMany({
      where: { customerId },
      select: {
        orderId: true,
        totalAmount: true,
        orderStatusDetails: {
          select: {
            orderStatusId: true,
            orderStatusName: true,
            // key: true,
          },
        },
      },
    });
  }

  async findCustomerOrderByCustomerId(customerId: string, orderId: string) {
    return await prisma.order.findFirst({
      where: { orderId, customerId },
      select: {
        orderId: true,
        totalAmount: true,
        orderStatusDetails: {
          select: {
            orderStatusId: true,
            orderStatusName: true,
            // key: true,
          },
        },
      },
    });
  }

  async getCustomerByCustomerId(customerId: string) {
    return prisma.customer.findUnique({ where: { customerId } });
  }

  async updateDeactivateAccount(customerId: string) {
    return await prisma.customer.update({
      where: { customerId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
      },
    });
  }

}
export const customerRepository = new CustomerRepository();
