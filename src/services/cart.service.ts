import { menuItemService } from "./menuItem.service";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { CartEventDTO } from "../dto/cartEvent.dto";
import { cartRepository } from "../repositories/cart.repository";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { cartEventService } from "./cartEvent.service";
import { ExtendedTransactionClient, prisma } from "../config/prisma.config";
import { PrismaTx } from "../types/prisma.types";
import { withTransaction } from "../utils/transaction.util";
import { CartEventType } from "../generated/prisma/enums";

class CartService {
  async handleCartEvent(event: CartEventDTO, customerId: string) {
    if (!event.eventType) throw BadRequestError("Event Type is required");
    switch (event.eventType) {
      case CartEventType.ADD_TO_CART:
        return await this.addToCart({ menuItemId: event.menuItemId!, quantity: event.quantity! }, customerId);

      case CartEventType.UPDATE_QUANTITY:
        return await this.updateQuantityByMenuItemId(event.menuItemId!, event.quantity!, customerId);

      case CartEventType.REMOVE_FROM_CART:
        return await this.removeCartItemByMenuItemId(event.menuItemId!, customerId);

      case CartEventType.CLEAR_CART:
        return await this.clearCart(customerId);

      default:
        throw BadRequestError("Invalid Event Type");
    }
  }

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

  async getCartWithCartItemsByCustomerId(customerId: string, tx?: PrismaTx | ExtendedTransactionClient) {
    return await withTransaction(tx, async (activeTx) => {
      return await cartRepository.getCartWithCartItemsByCustomerId(customerId, activeTx);
    });
  }

  private async updateQuantityByMenuItemId(menuItemId: string, quantity: number, customerId: string) {
    const cartId = await cartRepository.findCartIdByCustomerId(customerId);

    return await prisma.$transaction(async (tx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.UPDATE_QUANTITY,
        menuItemId,
        quantity,
      }, tx);

      return await cartRepository.updateCartItemQuantityByCartIdAndMenuItemId(
        cartId,
        menuItemId,
        quantity,
        tx
      );
    });
  }

  private async removeCartItemByMenuItemId(menuItemId: string, customerId: string) {
    const cartId = await cartRepository.findCartIdByCustomerId(customerId);

    return await prisma.$transaction(async (tx) => {
      // 1. Remove Item (returns deleted item with price)
      const deletedItem = await cartRepository.removeCartItemByCartIdAndMenuItemId(
        cartId,
        menuItemId,
        tx
      );

      // 2. Log Event
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.REMOVE_FROM_CART,
        menuItemId,
        price: deletedItem.price
      }, tx);

      return deletedItem;
    });
  }

  async clearCart(customerId: string, tx?: PrismaTx | ExtendedTransactionClient) {
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

  async lockCart(customerId: string, tx?: PrismaTx | ExtendedTransactionClient) {
    await withTransaction(tx, async (activeTx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.LOCK_CART,
      }, activeTx as PrismaTx);

      await cartRepository.lockCart(customerId, activeTx);
    });
  }

  async unlockCart(customerId: string, tx?: PrismaTx | ExtendedTransactionClient) {
    await withTransaction(tx, async (activeTx) => {
      await cartEventService.createEvent({
        customerId,
        eventType: CartEventType.UNLOCK_CART,
      }, activeTx as PrismaTx);

      await cartRepository.unlockCart(customerId, activeTx);
    });
  }

  async clearCartByCustomerId(customerId: string, tx?: PrismaTx | ExtendedTransactionClient) {
    await this.clearCart(customerId, tx);
  }
}
export const cartService = new CartService();
