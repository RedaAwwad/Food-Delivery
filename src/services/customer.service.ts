import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { customerRepository } from "../repositories/customer.repository";
import { CreateCustomerRatingDto } from "../dto/customer.dto";
import { removeFields } from "../utils/object.utils";
import { ratingService } from "./rating.service";

class CustomerService {
  async getCustomerOrdersByCustomerId(customerId: string) {
    return await customerRepository.findCustomerOrders(customerId);
  }

  async findCustomerOrderByCustomerId(customerId: string, orderId: string) {
    return await customerRepository.findCustomerOrderByCustomerId(customerId, orderId);
  }

  async deactivateAccount(customerId: string) {
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
  async createRatingByCustomer(customerId:string , createCustomerRatingDto:CreateCustomerRatingDto) {
     
   return await ratingService.createRatingByCustomer(customerId , createCustomerRatingDto)
  }
}
export const customerService = new CustomerService();
