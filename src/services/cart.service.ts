import { StatusCodes } from "http-status-codes";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { Cart } from "../generated/prisma";
import { cartRepository } from "../repositories/cart.repository";
import { CustomError } from "../utils/errors/custom-error";

class CartService {
  async addToCart(cartItem: CreateCartItemDTO, customerId: number) {
    // const cartRepository = new cartRepository()
    const cart = await cartRepository.upsertCart(customerId)

    const newCartItem = await cartRepository.createItem(cartItem, cart.id)
    return { cart, item: newCartItem }
  }
  async viewCart(customerId: number) {
    const cart = await cartRepository.findCartByCustomerId(customerId)
    if (!cart) {
      throw new CustomError({
        message: "The customer doesn't have cart",
        statusCode: StatusCodes.BAD_REQUEST
      })
    }
    return cart
  }
  async updateQuantity(updateQuantityDto: {
    itemId: number;
    quantity: number;
  }) {
    // check if the authenticated user owns the cart item
    // TODO: get customerId from auth
    const cart = await cartRepository.findByCustomerId(1);
    if (!cart) {
      throw new CustomError({
        statusCode: 404,
        code: "ERR_NF",
        message: "Cart not found!",
      });
    }

    const updatedItem = await cartRepository.updateItemQuantity({
      ...updateQuantityDto,
      cartId: cart.id,
    });
    return updatedItem;
  }

  async removeItem(removeCartItemDto: RemoveCartItemDTO) {
    // get authenticated user cart
    const cart = await cartRepository.findByCustomerId(1);
    if (!cart) {
      throw new CustomError({
        statusCode: 404,
        code: "ERR_NF",
        message: "Cart not found!",
      });
    }

    return await cartRepository.removeItemFromCart({
      ...removeCartItemDto,
      cartId: cart.id,
    });
  }

  async clearCart(cartId: number) {

    const cart = await cartRepository.findCartById(cartId);
    if (!cart) {
      throw new CustomError({
        statusCode: 404,
        code: "ERR_NF",
        message: "Cart not found!",
      });
    }

    await cartRepository.clearCart(cartId);
  }
}
export const cartService = new CartService();
