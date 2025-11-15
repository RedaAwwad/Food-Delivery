import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { prisma } from "../config/prisma.config";
import { restaurantRepository, RestaurantRepository } from "../repositories/restaurant.repository";
import { userRepository } from "../repositories/user.repository";
import { customerRepository } from "../repositories/customer.repository";

class CustomerService {
  async deactivateAccount(customerId: number) {
    const customer = customerRepository.getCustomerByCustomerId(customerId)
    if (!customer) {
      throw new CustomError({
        message:"NO found customer" , 
        statusCode:StatusCodes.BAD_REQUEST
      })
    }
    const updateCustomer = customerRepository.updateDeactivateAccount
    return  updateCustomer
  }

 
}
export const customerService = new CustomerService();
