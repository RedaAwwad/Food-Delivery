import { CreateCustomerRatingDto, updateCustomerRatingDto } from "../dto/rating.dto"
import { restaurantService } from "./restaurant.service"
import { ratingRepository } from "../repositories/rating.repository"
import { BadRequestError } from "../utils/errors"

class RatingService {
  async findRatingsByRestaurantId(restaurantId: string) {
    return await ratingRepository.findRatingsByRestaurantId(restaurantId)
  }

  async findRatingsByCustomerId(customerId: string) {
    return await ratingRepository.findRatingsByCustomerId(customerId)
  }

  async findRatingByRestaurantIdAndCustomerId(restaurantId: string, customerId: string) {
    return await ratingRepository.findRatingByRestaurantIdAndCustomerId(restaurantId, customerId)
  }

  async findTopRatedRestaurants() {
    return await ratingRepository.findTopRatedRestaurants()
  }

  async createRatingByCustomer(createCustomerRatingDto: CreateCustomerRatingDto) {
    const restaurant = await restaurantService.findRestaurantByRestaurantId(createCustomerRatingDto.restaurantId)

    if (!restaurant) {
      throw BadRequestError('restaurant not found')
    }

    const rating = await ratingRepository.createRatingByCustomer(createCustomerRatingDto)

    await this.syncRestaurantRatingStats(createCustomerRatingDto.restaurantId);

    return rating;
  }

  async updateRatingByRestaurantIdAndCustomerId(data: updateCustomerRatingDto) {
    const rating = await ratingRepository.updateRatingByRestaurantIdAndCustomerId(data)

    await this.syncRestaurantRatingStats(rating.restaurantId);

    return rating;
  }

  async deleteRatingByRestaurantIdAndCustomerId(ratingId: string) {
    const rating = await ratingRepository.deleteRatingByRestaurantIdAndCustomerId(ratingId)

    await this.syncRestaurantRatingStats(rating.restaurantId);

    return rating;
  }

  private async syncRestaurantRatingStats(restaurantId: string) {
    const stats = await ratingRepository.calculateRestaurantRatingStats(restaurantId);
    await restaurantService.updateRestaurantRating({restaurantId, averageRating: stats.averageRating, ratingCount: stats.ratingCount});
  }
}
export const ratingService = new RatingService()