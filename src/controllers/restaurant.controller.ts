import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { restaurantService } from "../services/restaurant.service";
import { PaginationDto } from "../utils/pagination.utils";

class RestaurantController {
  async findRestaurantByUserId(req: Request, res: Response) {
    const userId = req.user!.userId;
    const restaurant = await restaurantService.findRestaurantByUserId(userId);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async findRestaurantByRestaurantId(req: Request, res: Response) {
    const { restaurantId } = req.body;
    const restaurant = await restaurantService.findRestaurantByRestaurantId(restaurantId);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async findAllRestaurants(req: Request, res: Response) {
    const { data, meta } = await restaurantService.findAllRestaurants(req.query);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data,
        meta,
      })
    );
  }

  async createRestaurant(req: Request, res: Response) {
    const restaurant = await restaurantService.createRestaurant(req.body);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async updateRestaurant(req: Request, res: Response) {
    const restaurant = await restaurantService.updateRestaurant(req.body);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async updateRestaurantRating(req: Request, res: Response) {
    const { restaurantId } = req.body;
    const restaurant = await restaurantService.updateRestaurantRating(restaurantId);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async deleteRestaurant(req: Request, res: Response) {
    const { restaurantId } = req.body;
    const restaurant = await restaurantService.deleteRestaurant(restaurantId);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async enableOrDisableRestaurant(req: Request, res: Response) {
    const { restaurantId } = req.body;
    const restaurant = await restaurantService.enableOrDisableRestaurant(restaurantId);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurant,
      })
    );
  }

  async searchRestaurants(req: Request, res: Response) {
    const query = req.query.restaurantName as string;
    const restaurants = await restaurantService.searchRestaurants(query);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: restaurants,
      })
    );
  }

  //    async searchMenuItems(req:Request , res:Response) {
  //        const query = req.query
  //        const menuItems = await restaurantService.searchMenuItems(query);
  //        res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
  //         data:menuItems
  //        }))
  //    }
  // Address Management
  async addAddress(req: Request, res: Response) {
    const { restaurantId, ...addressData } = req.body;
    const address = await restaurantService.addAddress(restaurantId, addressData);
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: address }));
  }

  async updateAddress(req: Request, res: Response) {
    const { addressId } = req.params;
    const { restaurantId, ...updateData } = req.body;
    const address = await restaurantService.updateAddress(restaurantId, addressId as string, updateData);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: address }));
  }

  async deleteAddress(req: Request, res: Response) {
    const { addressId } = req.params;
    const { restaurantId } = req.body;
    await restaurantService.deleteAddress(restaurantId, addressId as string);
    res.status(StatusCodes.OK).json(new SuccessResponse({ message: "Address deleted successfully" }));
  }

  async getAddresses(req: Request, res: Response) {
    const restaurantId = (req.params.restaurantId) as string;
    const addresses = await restaurantService.getAddresses(restaurantId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: addresses }));
  }
}
export const restaurantController = new RestaurantController();

/**
 * /api/v1/search?keyword=meat
 *
 * Restaurant | MenuItem
 *
 * Way of implementation:
 * 1- Search in all restaurants
 * 2- Search in all menu items
 */
