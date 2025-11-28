import { prisma } from "../config/prisma.config";

export class RestaurantRepository {
    async findRestaurantByUserId(userId: string) {
        return await prisma.restaurant.findUnique({
            where: {
                managerId: userId,
            },
        });
    }
}
export const restaurantRepository = new RestaurantRepository();