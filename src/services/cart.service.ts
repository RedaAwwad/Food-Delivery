import { menuItemService } from "./menuItem.service";
import { CreateCartItemDTO, UpdateCartItemQuantityDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { cartRepository } from "../repositories/cart.repository";
import { NotFoundError } from "../utils/errors";
import { cartEventService } from "./cartEvent.service";
import { prisma } from "../config/prisma.config";
import { CartEventType } from "../generated/prisma";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "../generated/prisma";
import { withTransaction } from "../utils/transaction.util";

class CartService {
  async addToCart(cartItem: CreateCartItemDTO, customerId: string) {
    const menuItem = await menuItemService.getMenuItemById(cartItem.menuItemId);

    if (!menuItem) throw NotFoundError("Menu Item not found");

    let cart: any = await cartRepository.getCartWithCartItemsByCustomerId(customerId);

    const existingItem = cart.cartItems?.find((item: any) => item.menuItemId === cartItem.menuItemId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantity + cartItem.quantity;

    if (menuItem.stockQuantity < newTotalQuantity) throw NotFoundError("Not enough stock");

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
        { ...cartItem, quantity: newTotalQuantity },
        cart.cartId,
        { name: menuItem.menuItemName, price: menuItem.price },
        tx
      );
    });

    cart.cartItems = [newCartItem];

    return { cart };
  }

  async getCartWithCartItemsByCustomerId(customerId: string, tx?: PrismaTx | PrismaClient) {
    return await withTransaction(tx, async (activeTx) => {
      return await cartRepository.getCartWithCartItemsByCustomerId(customerId, activeTx);
    });
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

  async clearCart(customerId: string, tx?: PrismaTx | PrismaClient) {
    const cart = await cartRepository.findCartByCustomerId(customerId);
    if (!cart) throw NotFoundError("Cart not found!");

    await withTransaction(tx, async (activeTx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.CLEAR_CART,
      }, activeTx as PrismaTx);

      await cartRepository.clearCart(cart.cartId, activeTx);
    });
  }

  async lockCart(customerId: string, tx?: PrismaTx | PrismaClient) {
    await withTransaction(tx, async (activeTx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.LOCK_CART,
      }, activeTx as PrismaTx);

      await cartRepository.lockCart(customerId, activeTx);
    });
  }

  async unlockCart(customerId: string, tx?: PrismaTx | PrismaClient) {
    await withTransaction(tx, async (activeTx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.UNLOCK_CART,
      }, activeTx as PrismaTx);

      await cartRepository.unlockCart(customerId, activeTx);
    });
  }

  async clearCartByCustomerId(customerId: string, tx?: PrismaTx | PrismaClient) {
    await this.clearCart(customerId, tx);
  }
}
export const cartService = new CartService();
