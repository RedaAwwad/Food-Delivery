import { prisma } from "../config/prisma.config";
import { createRestaurantDto, updateRestaurantDto, updateRestaurantRatingDto } from "../dto/restaurant.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";

class RestaurantRepository {
    async findRestaurantByUserId(userId: string) {
        const restaurant = await prisma.restaurant.findUnique({
            where: {
                managerId: userId,
            },
        });

        if (!restaurant)
            throw NotFoundError("Restaurant not found");

        return restaurant;
    }

    async findRestaurantByRestaurantId(restaurantId: string) {
        const restaurant = await prisma.restaurant.findUniqueOrThrow({
            where: { restaurantId }
        })

        if (!restaurant)
            throw NotFoundError("Restaurant not found");

        return restaurant;
    }

    // async findRestaurantByRestaurantName(restaurantName: string) {
    //     const restaurant = await prisma.restaurant.findUniqueOrThrow({
    //         where: { restaurantName }
    //     })

    //     if (!restaurant)
    //         throw NotFoundError("Restaurant not found");

    //     return restaurant;
    // }

    async findAllRestaurants() {
        const restaurants = await prisma.restaurant.findMany()

        if (!restaurants)
            throw NotFoundError("No Restaurants found");

        return restaurants;
    }

    async createRestaurant(data: createRestaurantDto) {
        const restaurant = await prisma.restaurant.create({
            data: {
                ...data
            }
        })

        if (!restaurant)
            throw BadRequestError("Failed To Create Restaurant");

        return restaurant;
    }

    async updateRestaurant(data: updateRestaurantDto) {
        try {
            const restaurant = await prisma.restaurant.update({
                where: { restaurantId: data.restaurantId },
                data: {
                    ...data
                }
            })

            return restaurant;
        }
        catch (error: any) {
            if (error.code === 'P2025') {
                throw NotFoundError("Restaurant not found", error);
            }
            throw BadRequestError("Failed To Update Restaurant", error);
        }
    }

    async enableOrDisableRestaurant(restaurantId: string) {
        const restaurant = await this.findRestaurantByRestaurantId(restaurantId);
        if (!restaurant)
            throw NotFoundError("Restaurant not found");

        const updatedRestaurant = await prisma.restaurant.update({
            where: { restaurantId },
            data: {
                isAvailable: !restaurant.isAvailable
            }
        })

        if (!updatedRestaurant)
            throw BadRequestError("Failed To Update Restaurant");

        return updatedRestaurant;
    }

    async updateRestaurantRating(data: updateRestaurantRatingDto) {
        try {
            const restaurant = await prisma.restaurant.update({
                where: { restaurantId: data.restaurantId },
                data: {
                    averageRating: data.averageRating,
                    ratingCount: data.ratingCount
                }
            });

            return restaurant;
        }
        catch (error: any) {
            if (error.code === 'P2025') {
                throw NotFoundError("Restaurant not found", error);
            }
            throw BadRequestError("Failed To Update Restaurant Rating", error);
        }
    }

    async searchRestaurants(query: string) {
        return await prisma.restaurant.findMany({
            where: {
                restaurantName: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
        });
    }

    async deleteRestaurant(restaurantId: string) {
        const restaurant = await this.findRestaurantByRestaurantId(restaurantId);
        if (!restaurant)
            throw NotFoundError("Restaurant not found");

        const deletedRestaurant = await prisma.restaurant.delete({
            where: { restaurantId },
        })

        if (!deletedRestaurant)
            throw BadRequestError("Failed To Delete Restaurant");

        return deletedRestaurant;
    }
}
export const restaurantRepository = new RestaurantRepository();