import { prisma } from "../config/prisma.config";
import { CreateCustomerRatingDto, updateCustomerRatingDto } from "../dto/rating.dto";
import { RatingScore } from "../generated/prisma";
import { BadRequestError, NotFoundError } from "../utils/errors";

class RatingRepository {
  async findRatingsByRestaurantId(restaurantId: string) {
    const ratings = await prisma.rating.findMany({
      where: {
        restaurantId
      }
    })

    if (!ratings)
      throw NotFoundError("No Ratings found For This Restaurant");

    return ratings
  }

  async findRatingsByCustomerId(customerId: string) {
    const ratings = await prisma.rating.findMany({
      where: {
        customerId
      }
    })
    if (!ratings)
      throw NotFoundError("No Ratings found For This Customer");

    return ratings
  }

  async findRatingByRestaurantIdAndCustomerId(restaurantId: string, customerId: string) {
    const rating = await prisma.rating.findMany({
      where: {
        restaurantId,
        customerId
      }
    })

    if (!rating)
      throw NotFoundError("You have not Rated This Restaurant");

    return rating
  }

  async findTopRatedRestaurants() {
    return await prisma.restaurant.findMany({
      where: {
        averageRating: {
          gte: 4.0
        }
      },
      orderBy: {
        averageRating: 'desc'
      }
    });
  }

  async createRatingByCustomer(createCustomerRatingDto: CreateCustomerRatingDto) {
    const rating = await prisma.rating.create({
      data: {
        customerId: createCustomerRatingDto.customerId,
        restaurantId: createCustomerRatingDto.restaurantId,
        ratingScore: createCustomerRatingDto.ratingScore,
        review: createCustomerRatingDto.review ?? null
      }
    });

    return rating;
  }

  async updateRatingByRestaurantIdAndCustomerId(data: updateCustomerRatingDto) {
    try {
      const updatedRating = await prisma.rating.update({
        where: {
          ratingId: data.ratingId
        },
        data: {
          ratingScore: data.ratingScore,
          ...(data.review !== undefined && { review: data.review })
        }
      });

      return updatedRating;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw NotFoundError("Rating not found", error);
      }
      throw BadRequestError("Failed To Update Rating", error);
    }
  }

  async deleteRatingByRestaurantIdAndCustomerId(ratingId: string) {
    try {
      const deletedRating = await prisma.rating.delete({
        where: {
          ratingId
        }
      });

      return deletedRating;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw NotFoundError("Rating not found", error);
      }
      throw BadRequestError("Failed To Delete Rating", error);
    }
  }

  async calculateRestaurantRatingStats(restaurantId: string): Promise<{ averageRating: number; ratingCount: number }> {
    const ratings = await prisma.rating.findMany({
      where: { restaurantId }
    });

    if (ratings.length === 0) {
      return { averageRating: 0, ratingCount: 0 };
    }

    const totalScore = ratings.reduce((sum, r) => sum + this.getRatingValue(r.ratingScore), 0);
    const averageRating = totalScore / ratings.length;

    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingCount: ratings.length
    };
  }

  private getRatingValue(score: RatingScore): number {
    const values: Record<RatingScore, number> = {
      [RatingScore.ONE]: 1,
      [RatingScore.TWO]: 2,
      [RatingScore.THREE]: 3,
      [RatingScore.FOUR]: 4,
      [RatingScore.FIVE]: 5
    };
    return values[score];
  }
}

export const ratingRepository = new RatingRepository();