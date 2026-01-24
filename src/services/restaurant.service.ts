import {
  createRestaurantDto,
  searchMenuItemsFilterDto,
  updateRestaurantDto,
  updateRestaurantRatingDto,
} from "../dto/restaurant.dto";
import { restaurantRepository } from "../repositories/restaurant.repository";
import { prisma } from "../config/prisma.config";
import { formatPagination, PaginationDto } from "../utils/pagination.utils";
import { Pagination } from "../utils/response/success-response";

export class RestaurantService {
  async findRestaurantByManagerId(managerId: string) {
    return await prisma.restaurant.findUnique({
      where: {
        managerId,
      },
    });
  }

  async findRestaurantByRestaurantId(restaurantId: string) {
    return await restaurantRepository.findRestaurantByRestaurantId(restaurantId);
  }

  async searchMenuItems(query: searchMenuItemsFilterDto) {
    const { menuItemName, menuItemDesc, minPrice, maxPrice } = query;
  }

  async findRestaurantByUserId(userId: string) {
    return await restaurantRepository.findRestaurantByUserId(userId);
  }

  async findAllRestaurants(query: PaginationDto): Promise<{
    data: {
      restaurantId: string;
      restaurantName: string;
      isAvailable: boolean;
      averageRating: number;
      ratingCount: number;
    }[];
    meta: Pagination;
  }> {
    const { restaurants, total } = await restaurantRepository.findAllRestaurants(query);

    return {
      data: restaurants,
      meta: formatPagination({
        page: Number(query.page),
        perPage: Number(query.perPage),
        total,
      }),
    };
  }

  async createRestaurant(data: createRestaurantDto) {
    return await restaurantRepository.createRestaurant(data);
  }

  async updateRestaurantRating(data: updateRestaurantRatingDto) {
    return await restaurantRepository.updateRestaurantRating(data);
  }

  async updateRestaurant(data: updateRestaurantDto) {
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
}
export const restaurantService = new RestaurantService();
