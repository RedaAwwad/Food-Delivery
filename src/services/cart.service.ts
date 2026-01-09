import { menuItemService } from "./menuItem.service";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { cartRepository } from "../repositories/cart.repository";
import { NotFoundError } from "../utils/errors";

class CartService {
  async addToCart(cartItem: CreateCartItemDTO, customerId: string) {
    const menuItem = await menuItemService.getMenuItemById(cartItem.menuItemId);

    if (!menuItem) throw NotFoundError("Menu Item not found");

    const cart = await cartRepository.upsertCart(customerId);
    console.log("the cart: ", cart);

    const newCartItem = await cartRepository.createCartItem(
      cartItem,
      cart.cartId,
      customerId,
      { name: menuItem.menuItemName, price: menuItem.price }
    );
    return { cart, item: newCartItem };
  }

  async viewCart(customerId: string) {
    const cart = await cartRepository.upsertCart(customerId);
    if (!cart) throw NotFoundError("The customer doesn't have cart");
    return cart;
  }

  async updateQuantity(updateQuantityDto: { cartItemId: string; quantity: number }, customerId: string) {
    const cart = await cartRepository.findCartByCustomerId(customerId);
    if (!cart) throw NotFoundError("Cart not found!");

    const updatedCartItem = await cartRepository.updateCartItemQuantity({
      ...updateQuantityDto,
      cartItemId: updateQuantityDto.cartItemId,
      cartId: cart.cartId,
      customerId,
    });
    return updatedCartItem;
  }

  async removeCartItem(removeCartItemDto: RemoveCartItemDTO, customerId: string) {
    const cart = await cartRepository.findCartByCustomerId(customerId);
    if (!cart) throw NotFoundError("Cart not found!");

    return await cartRepository.removeItemFromCart({
      ...removeCartItemDto,
      cartId: cart.cartId,
      customerId,
    });
  }

  async clearCart(customerId: string) {
    const cart = await cartRepository.findCartByCustomerId(customerId);
    if (!cart) throw NotFoundError("Cart not found!");

    await cartRepository.clearCart(cart.cartId, customerId);
  }
}
export const cartService = new CartService();
