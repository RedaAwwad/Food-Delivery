import { prisma } from "../config/prisma.config";

class UserRoleRepository {
  async assignRole(userId: string, roleId: string) {
    return prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRole(userId: string, roleId: string) {
    return prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }

  async findUserRoles(userId: string) {
    return prisma.userRole.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  }
}

export const userRoleRepository = new UserRoleRepository();
