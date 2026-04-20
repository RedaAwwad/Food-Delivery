import { Response } from "express";
import { cartService } from "../services/cart.service";
import { cartEventService } from "../services/cartEvent.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { CartEventDTO } from "../dto/cartEvent.dto";

class CartController {
  async addCartEvent(req: RequestWithUser<CartEventDTO>, res: Response) {
    const customerId = req.user.customerId!;
    const result = await cartService.handleCartEvent(req.body, customerId);
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: result }));
  }

  async getCartWithCartItemsByCustomerId(req: RequestWithUser, res: Response) {
    const customerId = req.user.customerId!;
    const cart = await cartService.getCartWithCartItemsByCustomerId(customerId);

    res.status(StatusCodes.OK).json(new SuccessResponse({ data: cart }));
  }

  async getCartEvents(req: RequestWithUser, res: Response) {
    const customerId = req.user.customerId!;
    const events = await cartEventService.getEventsByCustomerId(customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: events }));
  }
}

export const cartController = new CartController();
