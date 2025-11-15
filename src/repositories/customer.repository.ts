import { prisma } from "../config/prisma.config";

export class CustomerRepository {
  async findCustomerOrders(customerId: string) {
    return await prisma.customer.findMany({
      where: { id: Number(customerId) },
      select: {
        phone: true,
        avatar: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orders: {
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
