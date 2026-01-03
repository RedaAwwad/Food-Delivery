import { prisma } from "../config/prisma.config";
import { Address, Prisma } from "../generated/prisma";

class AddressRepository {
  async createAddress(data: Prisma.AddressUncheckedCreateInput): Promise<Address> {
    return prisma.address.create({
      data,
    });
  }

  async findAddressesByCustomerId(customerId: number): Promise<Address[]> {
    return prisma.address.findMany({
      where: { customerId },
      orderBy: { isPrimary: "desc" },
    });
  }

  async findAddressById(addressId: number): Promise<Address | null> {
    return prisma.address.findUnique({
      where: { id: addressId },
    });
  }

  async updateAddress(addressId: number, data: Prisma.AddressUpdateInput): Promise<Address> {
    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async unsetPrimaryAddresses(customerId: number, excludeAddressId?: number): Promise<void> {
    const whereClause: Prisma.AddressWhereInput = {
      customerId,
      isPrimary: true,
    };

    if (excludeAddressId) {
      whereClause.id = { not: excludeAddressId };
    }

    await prisma.address.updateMany({
      where: whereClause,
      data: { isPrimary: false },
    });
  }

  async deleteAddress(addressId: number): Promise<void> {
    await prisma.address.delete({
      where: { id: addressId },
    });
  }
}

export const addressRepository = new AddressRepository();
