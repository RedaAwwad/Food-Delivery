import { createRestaurantDto, searchMenuItemsFilterDto, updateRestaurantRatingDto } from "../dto/restaurant.dto";
import { restaurantRepository } from "../repositories/restaurant.repository";

export class RestaurantService {
  async findRestaurantByUserId(userId: string) {
    return await restaurantRepository.findRestaurantByUserId(userId)
  }

  async findRestaurantByRestaurantId(restaurantId: string) {
    return await restaurantRepository.findRestaurantByRestaurantId(restaurantId)
  }

  async findAllRestaurants() {
    return await restaurantRepository.findAllRestaurants()
  }

  async createRestaurant(data: createRestaurantDto) {
    return await restaurantRepository.createRestaurant(data);
  }
  
  async updateRestaurantRating(data: updateRestaurantRatingDto) {
    return await restaurantRepository.updateRestaurantRating(data);
  }

  async updateRestaurant(data: any) {
    return await restaurantRepository.updateRestaurant(data);
  }

  async enableOrDisableRestaurant(restaurantId: string) {
    return await restaurantRepository.enableOrDisableRestaurant(restaurantId);
  }

  async searchRestaurants(query: string) {
    return await restaurantRepository.searchRestaurants(query);
  }

  async deleteRestaurant(restaurantId: string) {
    return await restaurantRepository.deleteRestaurant(restaurantId);
  }
  
  // async searchMenuItems(query: searchMenuItemsFilterDto) {
  //   const { menuItemName, menuItemDesc, minPrice, maxPrice } = query;

  //   return await prisma.menuItem.findMany({
  //     where: {
  //       isActive: true,

  //       ...(menuItemName && {
  //         menuItemName: {
  //           contains: menuItemName,
  //           mode: "insensitive",
  //         },
  //       }),

  //       ...(menuItemDesc && {
  //         menuItemDesc: {
  //           contains: menuItemDesc,
  //           mode: "insensitive",
  //         },
  //       }),

  //       ...(minPrice !== undefined || maxPrice !== undefined
  //         ? {
  //           price: {
  //             ...(minPrice !== undefined && { gte: minPrice }),
  //             ...(maxPrice !== undefined && { lte: maxPrice }),
  //           },
  //         }
  //         : {}),
  //     },
  //   });
  // }
}
export const restaurantService = new RestaurantService()