import { prisma, ExtendedTransactionClient } from "../config/prisma.config";

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

  async getCustomerByUserId(userId: string) {
    return prisma.customer.findUnique({ where: { userId } });
  }

  async createCustomer(data: any, tx?: ExtendedTransactionClient) {
    return (tx || prisma).customer.create({ data });
  }

  async updateDeactivateAccount(customerId: string) {
    return await prisma.customer.update({
      where: { customerId },
      data: {
        deactivatedAt: new Date(),
      },
    });
  }

  // TODO: Add deactivate account
  async deactivateAccount(customerId: string) { }
}
export const customerRepository = new CustomerRepository();
