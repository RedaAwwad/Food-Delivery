import { prisma } from "../config/prisma.config";

export class CustomerRepository {
    async getCustomerByCustomerId(customerId:number) {
        return prisma.customer.findUnique({
            where: { id: customerId },
      });
    }
    async updateDeactivateAccount(customerId : number) {
     return await prisma.customer.update({
        where: { id: customerId },
        data: {
         isActive: false,
         deactivatedAt: new Date(),
       },
     });
    } 
}
export const customerRepository = new CustomerRepository()