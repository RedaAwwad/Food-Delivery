import { StatusCodes } from "http-status-codes"
import { prisma } from "../config/prisma.config"
import { CreateCustomerRatingDto } from "../dto/customer.dto"
import { CustomError } from "../utils/errors/custom-error"
import { restaurantService } from "./restaurant.service"
import { ratingRepository } from "../repositories/rating.repository"

class RatingService {
  async createRatingByCustomer(customerId:string , createCustomerRatingDto:CreateCustomerRatingDto) {
    // cheak the restaurant is found.
      const restaurant = await restaurantService.findRestaurantByRestaurantId(
        createCustomerRatingDto.restaurantId
      )
      
      if (!restaurant) {
         throw new CustomError({message:'The restaurant ffff not found' ,statusCode:StatusCodes.BAD_REQUEST })
      }
    return await ratingRepository.createRatingByCustomer(customerId , createCustomerRatingDto)
  }
}
export const ratingService = new RatingService()