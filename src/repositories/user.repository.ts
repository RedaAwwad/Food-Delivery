import { prisma } from "../config/prisma.config";

export class UserRepository {
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