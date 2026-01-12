import { prisma } from "../config/prisma.config";
import { Address, Prisma } from "../generated/prisma";

class AddressRepository {
  async createAddress(data: Prisma.AddressUncheckedCreateInput): Promise<Address> {
    return prisma.address.create({
      data,
    });
  }

  async findAddressesByCustomerId(customerId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { customerId },
      orderBy: { isPrimary: "desc" },
    });
  }

  async findAddressById(addressId: string): Promise<Address | null> {
    return prisma.address.findUnique({
      where: { addressId },
    });
  }

  async updateAddress(addressId: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return prisma.address.update({
      where: { addressId },
      data,
    });
  }

  async unsetPrimaryAddresses(customerId: string, excludeAddressId?: string): Promise<void> {
    const whereClause: Prisma.AddressWhereInput = {
      customerId,
      isPrimary: true,
    };

    if (excludeAddressId) {
      whereClause.addressId = { not: excludeAddressId };
    }

    await prisma.address.updateMany({
      where: whereClause,
      data: { isPrimary: false },
    });
  }

  async deleteAddress(addressId: string): Promise<void> {
    await prisma.address.delete({
      where: { addressId },
    });
  }
}

export const addressRepository = new AddressRepository();
