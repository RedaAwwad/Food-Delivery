import { prisma } from "../config/prisma.config";

class RoleRepository {
    async createRole(data: { roleName: string; roleDesc?: string }) {
        return prisma.role.create({
            data: {
                roleName: data.roleName,
                roleDesc: data.roleDesc ?? null
            }
        });
    }

    async findByName(roleName: string) {
        return prisma.role.findFirst({
            where: {
                roleName: {
                    equals: roleName,
                    mode: 'insensitive'
                }
            }
        });
    }

    async findById(roleId: string) {
        return prisma.role.findUnique({
            where: { roleId }
        });
    }

    async findAll() {
        return prisma.role.findMany();
    }

    async removeRoleById(roleId: string) {
        return prisma.role.delete({
            where: { roleId }
        });
    }

    async removeRoleByName(roleName: string) {
        return prisma.role.delete({
            where: { roleName }
        });
    }
}

export const roleRepository = new RoleRepository();
