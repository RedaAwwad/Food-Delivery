import { prisma } from "../config/prisma.config";
import { restaurantRepository } from "../repositories/restaurant.repository";

export class RestaurantService {
    async findRestaurantByUserId(userId:string) {
        return await prisma.restaurant.findUnique({
            where:{
                managerId:userId
            }
        })
    }
    async findRestaurantByRestaurantId(restaurantId: string) {
        return await restaurantRepository.findRestaurantByRestaurantId(restaurantId)
    } 
}
export const restaurantService = new RestaurantService()