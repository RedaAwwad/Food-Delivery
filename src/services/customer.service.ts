import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { customerRepository } from "../repositories/customer.repository";

class CustomerService {
  async getCustomerOrdersByCustomerId(customerId: number) {
    return await customerRepository.findCustomerOrders(customerId);
  }

  async findCustomerOrderByCustomerId(customerId: number, orderId: number) {
    return await customerRepository.findCustomerOrderByCustomerId(customerId, orderId);
  }

  async deactivateAccount(customerId: number) {
    const customer = customerRepository.getCustomerByCustomerId(customerId);
    if (!customer) {
      throw new CustomError({
        message: "NO found customer",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    const updateCustomer = customerRepository.updateDeactivateAccount;
    return updateCustomer;
  }
}
export const customerService = new CustomerService();
