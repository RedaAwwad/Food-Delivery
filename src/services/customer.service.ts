import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { customerRepository } from "../repositories/customer.repository";

class CustomerService {
  async getCustomerOrdersByCustomerId(customerId: string) {
    return await customerRepository.findCustomerOrders(customerId);
  }

  async findCustomerOrderByCustomerId(customerId: string, orderId: string) {
    return await customerRepository.findCustomerOrderByCustomerId(customerId, orderId);
  }

  async deactivateAccount(customerId: string) {
    const customer = await customerRepository.getCustomerByCustomerId(customerId);
    if (!customer) {
      throw new CustomError({
        message: "NO found customer",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const updateCustomer = await customerRepository.updateDeactivateAccount(customerId);
    return updateCustomer;
  }
}
export const customerService = new CustomerService();
