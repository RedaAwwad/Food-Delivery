import { Request , Response } from 'express';
import { searchMenuItemSchema } from '../validation/restautant.schema';
import { StatusCodes } from 'http-status-codes';
import { SuccessResponse } from '../utils/response/success-response';
import { restaurantService } from '../services/restaurant.service';
class RestaurantController {
   async searchMenuItems(req:Request , res:Response) {
       const query = req.query
       const menuItems = await restaurantService.searchMenuItems(query);
       res.status(StatusCodes.ACCEPTED).json(new SuccessResponse({
        data:menuItems
       }))
   }    
}
export const restaurantController = new RestaurantController()