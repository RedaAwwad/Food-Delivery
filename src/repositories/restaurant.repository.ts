import { prisma } from "../config/prisma.config";

 class RestaurantRepository {
    async findRestaurantByUserId(userId: string) {
        return await prisma.restaurant.findUnique({
            where: {
                managerId: userId,
            },
        });
    }
    async findRestaurantByRestaurantId(restaurantId: string) {
        return await prisma.restaurant.findUniqueOrThrow({
            where:{restaurantId}
        })
    } 
}
export const restaurantRepository = new RestaurantRepository();