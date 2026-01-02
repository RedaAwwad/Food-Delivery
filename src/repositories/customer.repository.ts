import { prisma } from "../config/prisma.config";

export class CustomerRepository {
  async getCustomerByCustomerId(customerId: string) {
    return prisma.customer.findUnique({ where: { customerId } });
  }

  async createCustomer(data: any) {
    return prisma.customer.create({ data });
  }

  async updateDeactivateAccount(customerId: string) {
    return await prisma.customer.update({
      where: { customerId },
      data: {
        deactivatedAt: new Date(),
      },
    });
  }
}
export const customerRepository = new CustomerRepository();
