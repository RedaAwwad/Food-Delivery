import { prisma } from "../config/prisma.config";

export class UserRepository {
    async create(data: any) {
        return prisma.user.create({ data });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { userEmail: email } });
    }

    async update(userId: string, data: any) {
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
}
export const userRepository = new UserRepository();