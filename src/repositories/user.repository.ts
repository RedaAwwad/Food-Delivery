import { Prisma } from "../generated/prisma";
import { prisma } from "../config/prisma.config";
export class UserRepository {
  async createUser(data: any) {
    return prisma.user.create({ data });
  }

  async findUserByEmail(email: string, select?: Prisma.UserSelect) {
    const q: Prisma.UserFindUniqueArgs = {
      where: { userEmail: email },
    };

    if (select && Object.keys(select).length > 0) {
      q.select = select;
    }

    return await prisma.user.findUnique(q);
  }

  async findUserById(userId: string, select?: Prisma.UserSelect) {
    const q: Prisma.UserFindUniqueArgs = {
      where: { userId },
    };

    if (select && Object.keys(select).length > 0) {
      q.select = select;
    }

    return await prisma.user.findUnique(q);
  }

  async updateUser(userId: string, data: any) {
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

  async findUserByEmailWithRoles(email: string) {
    return prisma.user.findUnique({
      where: { userEmail: email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findUserByIdWithRoles(userId: string) {
    return prisma.user.findUnique({
      where: { userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }
}
export const userRepository = new UserRepository();
