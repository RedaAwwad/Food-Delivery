import { customerRepository } from "../repositories/customer.repository";

class CustomerService {
  async getCustomerOrdersById(customerId: string) {
    return await customerRepository.findCustomerOrders(customerId);
  }
}
export const customerService = new CustomerService();
