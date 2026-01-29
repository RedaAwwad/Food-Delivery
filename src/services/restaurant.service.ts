import {
  createRestaurantDto,
  searchMenuItemsFilterDto,
  updateRestaurantDto,
  updateRestaurantRatingDto,
} from "../dto/restaurant.dto";
import { CreateAddressDTO, UpdateAddressDTO } from "../dto/address.dto";
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

  // Address Management
  async addAddress(restaurantId: string, data: CreateAddressDTO) {
    if (data.isPrimary) {
      await prisma.restaurant.address().unsetPrimary(restaurantId);
    }
    return await prisma.restaurant.address().add(restaurantId, data);
  }

  async updateAddress(
    restaurantId: string,
    addressId: string,
    data: UpdateAddressDTO
  ) {
    if (data.isPrimary) {
      await prisma.restaurant.address().unsetPrimary(restaurantId, addressId);
    }
    return await prisma.restaurant.address().update(restaurantId, addressId, data);
  }

  async deleteAddress(restaurantId: string, addressId: string) {
    return await prisma.restaurant.address().remove(restaurantId, addressId);
  }

  async getAddresses(restaurantId: string) {
    return await prisma.restaurant.address().list(restaurantId);
  }

  async getAddressById(restaurantId: string, addressId: string) {
    return await prisma.restaurant.address().findById(restaurantId, addressId);
  }
}
export const restaurantService = new RestaurantService();
