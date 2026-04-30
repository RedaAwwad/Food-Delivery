import { Response } from "express";
import { cartService } from "../services/cart.service";
import { cartEventService } from "../services/cartEvent.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { CartEventDTO } from "../dto/cartEvent.dto";
import { customerService } from "../services/customer.service";
import { UnauthorizedError } from "../utils/errors";

const resolveCustomerId = async (req: RequestWithUser) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw UnauthorizedError("Unauthorized to perform this action!");
  }

  const customer = await customerService.getCustomerByUserId(userId);
  if (!customer) {
    throw UnauthorizedError("Customer account not found for this session. Please login again.");
  }

  return customer.customerId;
};

class CartController {
  async addCartEvent(req: RequestWithUser<CartEventDTO>, res: Response) {
    const customerId = await resolveCustomerId(req);
    const result = await cartService.handleCartEvent(req.body, customerId);
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: result }));
  }

  async getCartWithCartItemsByCustomerId(req: RequestWithUser, res: Response) {
    const customerId = await resolveCustomerId(req);
    const cart = await cartService.getCartWithCartItemsByCustomerId(customerId);

    res.status(StatusCodes.OK).json(new SuccessResponse({ data: cart }));
  }

  async getCartEvents(req: RequestWithUser, res: Response) {
    const customerId = await resolveCustomerId(req);
    const events = await cartEventService.getEventsByCustomerId(customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: events }));
  }
}

export const cartController = new CartController();
