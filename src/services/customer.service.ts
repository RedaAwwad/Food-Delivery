import { StatusCodes } from "http-status-codes";
import { customerRepository } from "../repositories/customer.repository";
import { ratingService } from "./rating.service";
import { CustomError } from "../utils/errors";
import { CreateCustomerRatingDto } from "../dto/customer.dto";

class CustomerService {
  async createCustomer(data: any) {
    return await customerRepository.createCustomer(data);
  }

  async getCustomerByCustomerId(customerId: string) {
    return await customerRepository.getCustomerByCustomerId(customerId);
  }

  async deactivateAccount(customerId: string) {
    const customer = await customerRepository.getCustomerByCustomerId(customerId);
    if (!customer) {
      throw new CustomError({
        message: "NO found customer",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    return await customerRepository.deactivateAccount(customerId);
  }
  async createRatingByCustomer(
    customerId: string,
    createCustomerRatingDto: CreateCustomerRatingDto
  ) {
    return await ratingService.createRatingByCustomer(customerId, createCustomerRatingDto);
  }

  async updateDeactivateAccount(customerId: string) {
    return await customerRepository.updateDeactivateAccount(customerId);
  }

  async getCustomerByUserId(userId: string) {
    return await customerRepository.getCustomerByUserId(userId);
  }
}
export const customerService = new CustomerService();
