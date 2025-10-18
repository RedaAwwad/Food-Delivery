import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { Cart } from "../generated/prisma";
import { cartRepository } from "../repositories/cart.repository";
import { CustomError } from "../utils/errors/custom-error";

class CartService {
  async addToCart(cartItem: CreateCartItemDTO, customerId: number) {
    // check customer have cart or no
    // const cartRepository = new cartRepository()
    let cart = await cartRepository.findByCustomerId(customerId);

    if (!cart) {
      cart = (await cartRepository.createCart(customerId)) as Cart;
    }
    const existingItem = await cartRepository.findByCartAndMenuItem(
      cart.id,
      cartItem.menuItemId
    );
    let updateItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + cartItem.quantity;
      // TODO
      //   updateItem = await cartItemRepository.updateQuntity(existingItem.id , newQuantity)
    } else {
      updateItem = await cartRepository.createItem(cartItem, cart.id);
    }
    return { cart, item: updateItem };
  }

  async updateQuantity(updateQuantityDto: {
    itemId: string;
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
}
export const cartService = new CartService();
