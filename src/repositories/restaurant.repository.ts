import { prisma } from "../config/prisma.config";
import { getRestaurantResponseDto } from "../dto/restaurant.dto";

 class RestaurantRepository {
    async findRestaurantByUserId(userId: string) {
        return await prisma.restaurant.findUnique({
            where: {
                managerId: userId,
            },
        });
    }
    async findRestaurantByRestaurantId(
  restaurantId: string
): Promise<getRestaurantResponseDto> {

  return await prisma.restaurant.findUniqueOrThrow({
    where: { restaurantId },
    select: {
      restaurantName: true,
      restaurantLogo: true,
      isAvailable: true,

      menu: {
        include: {
          menuCategories: true
        }
      },

      rating: true,
      address: true
    }
  })
}
}
export const restaurantRepository = new RestaurantRepository();