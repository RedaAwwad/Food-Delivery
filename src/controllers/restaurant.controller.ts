import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/response/success-response';
import { restaurantService } from '../services/restaurant.service';

class RestaurantController {
    async findRestaurantByUserId(req: Request, res: Response) {
        const userId = req.user!.userId
        const restaurant = await restaurantService.findRestaurantByUserId(userId);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async findRestaurantByRestaurantId(req: Request, res: Response) {
        const { restaurantId } = req.body
        const restaurant = await restaurantService.findRestaurantByRestaurantId(restaurantId);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async findAllRestaurants(req: Request, res: Response) {
        const restaurant = await restaurantService.findAllRestaurants();
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async createRestaurant(req: Request, res: Response) {
        const restaurant = await restaurantService.createRestaurant(req.body);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async updateRestaurant(req: Request, res: Response) {
        const restaurant = await restaurantService.updateRestaurant(req.body);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async updateRestaurantRating(req: Request, res: Response) {
        const { restaurantId } = req.body
        const restaurant = await restaurantService.updateRestaurantRating(restaurantId);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async deleteRestaurant(req: Request, res: Response) {
        const { restaurantId } = req.body
        const restaurant = await restaurantService.deleteRestaurant(restaurantId);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async enableOrDisableRestaurant(req: Request, res: Response) {
        const { restaurantId } = req.body
        const restaurant = await restaurantService.enableOrDisableRestaurant(restaurantId);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurant
        }))
    }

    async searchRestaurants(req: Request, res: Response) {
        const query = req.query.restaurantName as string
        const restaurants = await restaurantService.searchRestaurants(query);
        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
            data: restaurants
        }))
    }

    //    async searchMenuItems(req:Request , res:Response) {
    //        const query = req.query
    //        const menuItems = await restaurantService.searchMenuItems(query);
    //        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
    //         data:menuItems
    //        }))
    //    }    
}
export const restaurantController = new RestaurantController();
