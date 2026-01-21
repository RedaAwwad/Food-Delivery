import { Response } from "express";
import { cartService } from "../services/cart.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import {
  CreateCartItemDTO,
  RemoveCartItemDTO,
  UpdateCartItemQuantityDTO,
} from "../dto/cartItem.dto";

class CartController {
  async addToCart(req: RequestWithUser<CreateCartItemDTO>, res: Response) {
    const customerId = req.user.customerId!;
    const cart = await cartService.addToCart(req.body, customerId);

    if (!cart) res.status(500).json({ error: "Internal Server Error" });

    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: cart }));
  }

  async getCartWithCartItemsByCustomerId(req: RequestWithUser, res: Response) {
    const customerId = req.user.customerId!;
    const cart = await cartService.getCartWithCartItemsByCustomerId(customerId);

    res.status(StatusCodes.OK).json(new SuccessResponse({ data: cart }));
  }

  async updateQuantity(req: RequestWithUser<UpdateCartItemQuantityDTO>, res: Response) {
    const customerId = req.user.customerId!;
    const updatedItem = await cartService.updateQuantity(req.body, customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: updatedItem }));
  }

  async removeCartItem(req: RequestWithUser<RemoveCartItemDTO>, res: Response) {
    const customerId = req.user.customerId!;
    await cartService.removeCartItem(req.body, customerId);
    res
      .status(StatusCodes.NO_CONTENT)
      .json(new SuccessResponse({ message: "Item removed successfully" }));
  }

  async clearCart(req: RequestWithUser, res: Response) {
    const customerId = req.user.customerId!;
    await cartService.clearCart(customerId);
    res
      .status(StatusCodes.NO_CONTENT)
      .json(new SuccessResponse({ message: "Cart cleared successfully" }));
  }
}

export const cartController = new CartController();
