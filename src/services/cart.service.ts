import { menuItemService } from "./menuItem.service";
import { CreateCartItemDTO, UpdateCartItemQuantityDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { cartRepository } from "../repositories/cart.repository";
import { NotFoundError } from "../utils/errors";
import { cartEventService } from "./cartEvent.service";
import { prisma } from "../config/prisma.config";
import { CartEventType } from "../generated/prisma";

class CartService {
  async addToCart(cartItem: CreateCartItemDTO, customerId: string) {
    const menuItem = await menuItemService.getMenuItemById(cartItem.menuItemId);

    if (!menuItem) throw NotFoundError("Menu Item not found");
    if (menuItem.stockQuantity < cartItem.quantity) throw NotFoundError("Not enough stock");

    const cart = await cartRepository.upsertCart(customerId);
    console.log("the cart: ", cart);

    const newCartItem = await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.ADD_TO_CART,
        menuItemId: cartItem.menuItemId,
        itemName: menuItem.menuItemName,
        quantity: cartItem.quantity,
        price: menuItem.price,
      }, tx);

      return await cartRepository.createCartItem(
        cartItem,
        cart.cartId,
        { name: menuItem.menuItemName, price: menuItem.price },
        tx
      );
    });
    return { cart, item: newCartItem };
  }

  async getCartWithCartItemsByCustomerId(customerId: string) {
    const cart = await cartRepository.upsertCart(customerId);
    if (!cart) throw NotFoundError("The customer doesn't have cart");
    const cartWithCartItems = await cartRepository.getCartWithCartItemsByCustomerId(customerId);
    return cartWithCartItems;
  }

  async updateQuantity(updateQuantityDto: UpdateCartItemQuantityDTO, customerId: string) {
    const cart = await cartRepository.getCartWithOneCartItemByCustomerIdAndCartItemId(customerId, updateQuantityDto.cartItemId);

    if (!cart) throw NotFoundError("Cart not found!");

    const cartItem = cart.cartItems[0];
    if (!cartItem) throw NotFoundError("Cart Item not found in cart");

    const updatedCartItem = await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.UPDATE_QUANTITY,
        menuItemId: cartItem.menuItemId,
        quantity: updateQuantityDto.quantity,
      }, tx);

      return await cartRepository.updateCartItemQuantity({
        ...updateQuantityDto,
      }, tx);
    });

    return updatedCartItem;
  }

  async removeCartItem(removeCartItemDto: RemoveCartItemDTO, customerId: string) {
    const cart = await cartRepository.getCartWithOneCartItemByCustomerIdAndCartItemId(customerId, removeCartItemDto.cartItemId);

    if (!cart) throw NotFoundError("Cart not found!");
    const item = cart.cartItems[0];
    if (!item) throw NotFoundError("Item not found in cart");

    return await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.REMOVE_FROM_CART,
        menuItemId: item.menuItemId,
        price: item.price
      }, tx);

      return await cartRepository.removeItemFromCart({
        ...removeCartItemDto,
      }, cart.cartId, tx);
    });
  }

  async clearCart(customerId: string) {
    const cart = await cartRepository.findCartByCustomerId(customerId);
    if (!cart) throw NotFoundError("Cart not found!");

    await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.CLEAR_CART,
      }, tx);

      await cartRepository.clearCart(cart.cartId, tx);
    });
  }

  async lockCart(customerId: string) {
    await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.LOCK_CART,
      }, tx);

      await cartRepository.lockCart(customerId, tx);
    });
  }

  async unlockCart(customerId: string) {
    await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.UNLOCK_CART,
      }, tx);

      await cartRepository.unlockCart(customerId, tx);
    });
  }

  async clearCartByCustomerId(customerId: string) {
    await this.clearCart(customerId);
  }
}
export const cartService = new CartService();
