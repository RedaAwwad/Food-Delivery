import { prisma } from "../config/prisma.config";
import { searchMenuItemsFilterDto } from "../dto/restaurant.dto";
import { Prisma } from "../generated/prisma";
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
    async searchMenuItems(query: searchMenuItemsFilterDto) {
  const { menuItemName, menuItemDesc, minPrice, maxPrice } = query;

  return await prisma.menuItem.findMany({
    where: {
      isActive: true,

      ...(menuItemName && {
        menuItemName: {
          contains: menuItemName,
          mode: "insensitive",
        },
      }),

      ...(menuItemDesc && {
        menuItemDesc: {
          contains: menuItemDesc,
          mode: "insensitive",
        },
      }),

      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
    },
  });
}

}
export const restaurantService = new RestaurantService()