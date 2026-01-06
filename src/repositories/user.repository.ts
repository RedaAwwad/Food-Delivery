import { prisma } from "../config/prisma.config";
import { User } from "../generated/prisma";

export class UserRepository {
  async create(data: any) {
    return prisma.user.create({ data });
  }

  async findUserByEmail<T>(
    email: string,
    select?: Record<string, unknown>
  ): Promise<(Pick<User, "userId" | "userName" | "userEmail" | "isAdmin"> & T) | null> {
    return prisma.user.findUnique({
      where: { userEmail: email, isActive: true },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        isAdmin: true,
        ...select,
      },
    });
  }

  async update(userId: string, data: any) {
    return prisma.user.update({
      where: { userId },
      data,
    });
  }

  async updateIsActive(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { userId },
      data: { isActive },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
      },
    });
  }

  async findUserWithRestaurant(userId: string, userRole: string) {
    return prisma.user.findUnique({
      where: { userId },
      include: {
        restaurant: userRole === "restaurant" ? true : false,
      },
    });
  }

  async findAndUpdateUserByEmail(email: string, data: any) {
    return prisma.user.update({
      where: { userEmail: email },
      data,
    });
  }

  async getUserByRestaurantId<T>(
    userId: string,
    restaurantId: string,
    select?: Record<string, unknown>
  ): Promise<(Pick<User, "userId" | "userName" | "userEmail" | "restaurant"> & T) | null> {
    return prisma.user.findUnique({
      where: {
        userId: Number(userId),
        restaurant: { restaurantId: Number(restaurantId) },
        usersRoles: {
          some: {
            role: {
              roleKey: "RESTAURANT_MANAGER",
            },
          },
        },
      },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        restaurant: true,
        ...select,
      },
    });
  }

  async getUserByCustomerId<T>(
    userId: string,
    customerId: string,
    select?: Record<string, unknown>
  ): Promise<(Pick<User, "userId" | "userName" | "userEmail" | "customer"> & T) | null> {
    return prisma.user.findUnique({
      where: {
        userId: Number(userId),
        customer: { customerId: Number(customerId) },
        usersRoles: {
          some: {
            role: {
              roleKey: "CUSTOMER",
            },
          },
        },
      },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        customer: true,
        ...select,
      },
    });
  }
}
export const userRepository = new UserRepository();
