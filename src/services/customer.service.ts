import { StatusCodes } from "http-status-codes";
import { customerRepository } from "../repositories/customer.repository";

class CustomerService {
  async createCustomer(data: any) {
    return await customerRepository.createCustomer(data);
  }

  async getCustomerByCustomerId(customerId: string) {
    return await customerRepository.getCustomerByCustomerId(customerId);
  }

  async updateDeactivateAccount(customerId: string) {
    return await customerRepository.updateDeactivateAccount(customerId);
  }

  async getCustomerByUserId(userId: string) {
    return await customerRepository.getCustomerByUserId(userId);
  }
}
export const customerService = new CustomerService();
