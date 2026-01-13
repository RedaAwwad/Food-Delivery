import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.config";
import { User } from "../generated/prisma";
import { CustomError } from "../utils/errors";

export class UserRepository {
  async create(data: any) {
    return prisma.user.create({ data });
  }

  async findUserByEmail<T>(
    email: string,
    select?: Record<string, unknown>
  ): Promise<(User & T) | null> {
    const user = await prisma.user.findUnique({
      where: { userEmail: email, isActive: true },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        isAdmin: true,
        ...select,
      },
    });

    return user as (User & T) | null;
  }

  async update(userId: string, data: any) {
    return await prisma.user.update({
      where: { userId },
      data,
    });
  }

  async updateIsActive(userId: string, isActive: boolean) {
    return await prisma.user.update({
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
    return await prisma.user.findUnique({
      where: { userId },
      include: {
        restaurant: userRole === "restaurant" ? true : false,
      },
    });
  }

  async findAndUpdateUserByEmail(email: string, data: any) {
    return await prisma.user.update({
      where: { userEmail: email },
      data,
    });
  }

  async getUserByRestaurantId<T>(
    userId: string,
    restaurantId: string,
    select?: Record<string, unknown>
  ): Promise<(Pick<User, "userId" | "userName" | "userEmail" | "restaurant"> & T) | null> {
    return await prisma.user.findUnique({
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
    return await prisma.user.findUnique({
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

  async findUserById<T>(userId: string, select: Record<string, unknown> = {}): Promise<User | T> {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        isAdmin: true,
        isConfirmed: true,
        isActive: true,
        customer: true,
        restaurant: true,
        userRoles: {
          select: {
            role: {
              select: {
                roleKey: true,
              },
            },
          },
        },
        ...select,
      },
    });

    if (!user) {
      throw new CustomError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    return user as User | T;
  }
}

export const userRepository = new UserRepository();
