import { Request, Response } from "express";
import { searchMenuItemSchema } from "../validation/restaurant.schema";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { restaurantService } from "../services/restaurant.service";
import { getRestaurantResponseDto } from "../dto/restaurant.dto";
class RestaurantController {
  async searchMenuItems(req: Request, res: Response) {
    const query = req.query;
    const menuItems = await restaurantService.searchMenuItems(query);
    res.status(StatusCodes.ACCEPTED).json(
      new SuccessResponse({
        data: menuItems,
      })
    );
  }
  async findRestaurantByRestaurantId(req: Request, res: Response) {
    const restaurantId = req.params.restaurantId!;
    const restaurant = await restaurantService.findRestaurantByRestaurantId(restaurantId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: restaurant }));
  }
}
export const restaurantController = new RestaurantController();
