import { Address } from "../generated/prisma";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { addressRepository } from "../repositories/address.repository";
import { CreateAddressDTO, UpdateAddressDTO } from "../dto/address.dto";

class AddressService {
  async createAddress(data: CreateAddressDTO & { customerId: string }): Promise<Address> {
    if (data.isPrimary) {
      await addressRepository.unsetPrimaryAddresses(data.customerId);
    }

    return addressRepository.createAddress({
      ...data,
      isPrimary: data.isPrimary || false,
    });
  }

  async getAddressesByCustomerId(customerId: string): Promise<Address[]> {
    return addressRepository.findAddressesByCustomerId(customerId);
  }

  async getAddressById(addressId: string): Promise<Address | null> {
    return addressRepository.findAddressById(addressId);
  }

  async updateAddress(
    addressId: string,
    customerId: string,
    data: UpdateAddressDTO
  ): Promise<Address> {
    const existingAddress = await addressRepository.findAddressById(addressId);

    if (!existingAddress) {
      throw new CustomError({
        message: "Address not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    // Check if the user is authorized to update the address
    if (existingAddress.customerId !== customerId) {
      throw new CustomError({
        message: "Unauthorized to update this address",
        statusCode: StatusCodes.FORBIDDEN,
      });
    }

    if (data.isPrimary) {
      await addressRepository.unsetPrimaryAddresses(customerId, addressId);
    }

    // Remove unwanted fields from data
    const { id, customerId: cid, createdAt, updatedAt, ...updateData } = data as any;

    return addressRepository.updateAddress(addressId, updateData);
  }

  async deleteAddress(addressId: string, customerId: string): Promise<void> {
    const existingAddress = await addressRepository.findAddressById(addressId);

    if (!existingAddress) {
      throw new CustomError({
        message: "Address not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    if (existingAddress.customerId !== customerId) {
      throw new CustomError({
        message: "Unauthorized to delete this address",
        statusCode: StatusCodes.FORBIDDEN,
      });
    }

    await addressRepository.deleteAddress(addressId);
  }
}

export const addressService = new AddressService();
