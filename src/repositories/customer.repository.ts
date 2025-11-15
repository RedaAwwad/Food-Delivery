import { prisma } from "../config/prisma.config";

class CustomerRepository {
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
}
export const customerRepository = new CustomerRepository();
