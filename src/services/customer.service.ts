import { StatusCodes } from "http-status-codes";
import { customerRepository } from "../repositories/customer.repository";
import { ratingService } from "./rating.service";
import { CustomError } from "../utils/errors";
import { CreateCustomerRatingDto } from "../dto/rating.dto";
import { orderService } from "./order.service";
import { Prisma } from "../generated/prisma";
import { prisma } from "../config/prisma.config";
import { CreateAddressDTO, UpdateAddressDTO } from "../dto/address.dto";

class CustomerService {
  async createCustomer(data: any, tx?: Prisma.TransactionClient) {
    return await customerRepository.createCustomer(data, tx);
  }

  async getCustomerByCustomerId(customerId: string) {
    return await customerRepository.getCustomerByCustomerId(customerId);
  }

  async findCustomerOrdersByCustomerId(customerId: string) {
    return await orderService.findAllCustomerOrdersByCustomerId(customerId);
  }

  async findCustomerOrderByCustomerId(customerId: string, orderId: string) {
    return await orderService.findOrderByOrderIdAndCustomerId(orderId, customerId);
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

  async createRatingByCustomer(customerId: string, data: any) {
    const payload: CreateCustomerRatingDto = {
      customerId,
      restaurantId: data.restaurantId,
      ratingScore: data.ratingScore,
      review: data.review,
    };

    return await ratingService.createRatingByCustomer(payload);
  }

  async updateDeactivateAccount(customerId: string) {
    return await customerRepository.updateDeactivateAccount(customerId);
  }

  async getCustomerByUserId(userId: string) {
    return await customerRepository.getCustomerByUserId(userId);
  }

  // Address Management
  async addAddress(customerId: string, data: CreateAddressDTO) {
    if (data.isPrimary) {
      await prisma.customer.address().unsetPrimary(customerId);
    }
    return await prisma.customer.address().add(customerId, data);
  }

  async updateAddress(
    customerId: string,
    addressId: string,
    data: UpdateAddressDTO
  ) {
    if (data.isPrimary) {
      await prisma.customer.address().unsetPrimary(customerId, addressId);
    }
    return await prisma.customer.address().update(customerId, addressId, data);
  }

  async deleteAddress(customerId: string, addressId: string) {
    return await prisma.customer.address().remove(customerId, addressId);
  }

  async getAddresses(customerId: string) {
    return await prisma.customer.address().list(customerId);
  }

  async getAddressById(customerId: string, addressId: string) {
    return await prisma.customer.address().findById(customerId, addressId);
  }
}
export const customerService = new CustomerService();
