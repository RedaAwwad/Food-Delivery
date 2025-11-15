import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cart.service";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";

class CartController {
  async addToCart(
    req: Request<{}, {}, CreateCartItemDTO>,
    res: Response,
    next: NextFunction
  ) {
    const customerId = 1; // TODO -When create Token , auth
    // TODO make-validation

    const cart = await cartService.addToCart(req.body, customerId);
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: cart }));
  }
  async viewCart(req: Request, res: Response) {
    const customerId = 1; // TODO -When create Token , auth
    const cart = await cartService.viewCart(customerId);

    res.status(StatusCodes.OK).json(new SuccessResponse({ data: cart }));
  }

  async updateQuantity(req: Request<{}, {}, UpdateQuantityDTO>, res: Response) {
    const updatedItem = await cartService.updateQuantity(req.body);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: updatedItem }));
  }

  async removeCartItem(req: Request<{}, {}, RemoveCartItemDTO>, res: Response) {
    await cartService.removeCartItem(req.body);
    res
      .status(StatusCodes.NO_CONTENT)
      .json(new SuccessResponse({ message: "Item removed successfully" }));
  }

  async clearCart(req: Request, res: Response) {
    const customerId = 1; // TODO - When creating token, get from auth
    await cartService.clearCart(customerId);
    res
      .status(StatusCodes.NO_CONTENT)
      .json(new SuccessResponse({ message: "Cart cleared successfully" }));
  }
}

export const cartController = new CartController();
