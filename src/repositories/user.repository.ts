import { Prisma, User } from "../generated/prisma";
import { prisma } from "../config/prisma.config";
import { NotFoundError } from "../utils/errors";
export class UserRepository {
  async createUser(data: any, tx?: Prisma.TransactionClient) {
    return (tx || prisma).user.create({ data });
  }

  async findUserByEmail<T = User>(email: string, select?: Prisma.UserSelect): Promise<T> {
    const q: Prisma.UserFindUniqueArgs = {
      where: { userEmail: email },
    };

    if (select && Object.keys(select).length > 0) {
      q.select = select;
    }

    return (await prisma.user.findUnique(q)) as T;
  }

  async findUserById<T = User>(userId: string, select?: Prisma.UserSelect): Promise<T> {
    const q: Prisma.UserFindUniqueArgs = {
      where: { userId },
    };

    if (select && Object.keys(select).length > 0) {
      q.select = select;
    }

    return (await prisma.user.findUnique(q)) as T;
  }

  async updateUser(userId: string, data: any) {
    return prisma.user.update({
      where: { userId },
      data,
    });
  }

  async updateIsActive(userId: string) {
    const user = await this.findUserById(userId, { isActive: true });

    if (!user) throw NotFoundError("User not found");

    return prisma.user.update({
      where: { userId },
      data: { isActive: !user.isActive },
      select: {
        userId: true,
        userName: true,
        userEmail: true,
        isActive: true,
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

  async findAndUpdateUserByEmail(userId: string, email: string, data: any) {
    return prisma.user.update({
      where: { userId, userEmail: email },
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
