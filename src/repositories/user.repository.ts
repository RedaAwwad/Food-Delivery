import { prisma } from "../config/prisma.config";

export class UserRepository {
    async createUser(data: any) {
        return prisma.user.create({ data });
    }

    async findUserByEmail(email: string) {
        return prisma.user.findUnique({ where: { userEmail: email } });
    }

    async updateUser(userId: string, data: any) {
        return prisma.user.update({
            where: { userId },
            data
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
            data
        });
    }

    async findUserByEmailWithRoles(email: string) {
        return prisma.user.findUnique({
            where: { userEmail: email },
            include: {
                usersRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });
    }

    async findUserByIdWithRoles(userId: string) {
        return prisma.user.findUnique({
            where: { userId },
            include: {
                usersRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });
    }
}
export const userRepository = new UserRepository();