import { prisma } from "../config/prisma.config";
import { RoleKey } from "../generated/prisma/client";

class RoleRepository {
  async createRole(data: { roleName: string; roleDesc?: string; roleKey: any }) {
    return prisma.role.create({
      data: {
        roleName: data.roleName,
        roleDesc: data.roleDesc ?? null,
        roleKey: data.roleKey,
      },
    });
  }

  async findRoleByKey(roleKey: RoleKey) {
    return prisma.role.findFirst({
      where: {
        roleKey,
      },
    });
  }

  async findById(roleId: string) {
    return prisma.role.findUnique({
      where: { roleId },
    });
  }

  async findAll() {
    return prisma.role.findMany();
  }

  async removeRoleById(roleId: string) {
    return prisma.role.delete({
      where: { roleId },
    });
  }

  async removeRoleByKey(roleKey: RoleKey) {
    return prisma.role.deleteMany({
      where: { roleKey },
    });
  }
}

export const roleRepository = new RoleRepository();
