import { StatusCodes } from "http-status-codes";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { cartRepository } from "../repositories/cart.repository";
import { CustomError } from "../utils/errors/custom-error";

class CartService {
  async addToCart(cartItem: CreateCartItemDTO, customerId: string) {
    // const cartRepository = new cartRepository()
    const cart = await cartRepository.upsertCart(customerId);
    console.log("the cart: ", cart);
    const newCartItem = await cartRepository.createCartItem(cartItem, cart.cartId);
    return { cart, item: newCartItem };
  }

  async viewCart(customerId: string) {
    // const cart = await cartRepository.findCartByCustomerId(customerId);
    const cart = await cartRepository.upsertCart(customerId);
    if (!cart) {
      throw new CustomError({
        message: "The customer doesn't have cart",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
    return cart;
  }

  async updateQuantity(updateQuantityDto: { cartItemId: string; quantity: number }) {
    // check if the authenticated user owns the cart item
    // TODO: get customerId from auth
    const cart = await cartRepository.findCartByCustomerId("019ac7a7-45f5-7d74-b4df-507df7312a78");
    if (!cart) {
      throw new CustomError({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Cart not found!",
      });
    }
    const updatedCartItem = await cartRepository.updateCartItemQuantity({
      ...updateQuantityDto,
      cartItemId: updateQuantityDto.cartItemId,
      cartId: cart.cartId,
    });
    return updatedCartItem;
  }

  async removeCartItem(removeCartItemDto: RemoveCartItemDTO) {
    // get authenticated user cart
    const cart = await cartRepository.findCartByCustomerId("019ac7a7-45f5-7d74-b4df-507df7312a78");
    if (!cart) {
      throw new CustomError({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Cart not found!",
      });
    }
    return await cartRepository.removeItemFromCart({
      ...removeCartItemDto,
      cartId: cart.cartId,
    });
  }

  async clearCart(customerId: string) {
    const cart = await cartRepository.findCartByCustomerId(customerId);
    if (!cart) {
      throw new CustomError({
        statusCode: StatusCodes.NOT_FOUND,
        message: "Cart not found!",
      });
    }

    await cartRepository.clearCart(cart.cartId);
  }
}
export const cartService = new CartService();
