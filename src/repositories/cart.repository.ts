import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";
import { CartEventType } from "../generated/prisma"; // Assuming types are generated

// Manual enum definition if not yet available in generated types during development
// enum CartEventType {
//   ADD_TO_CART = "ADD_TO_CART",
//   UPDATE_QUANTITY = "UPDATE_QUANTITY",
//   REMOVE_FROM_CART = "REMOVE_FROM_CART",
//   CLEAR_CART = "CLEAR_CART",
//   LOCK_CART = "LOCK_CART",
//   UNLOCK_CART = "UNLOCK_CART",
// }

class CartRepository {
  async findCartByCustomerId(customerId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    return cart;
  }

  async upsertCart(customerId: string) {
    return await prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      include: {},
    });
  }

  async getCartItemsByCustomerId(customerId: string) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        cartItems: {
          include: {
            menuItem: true, // Include menuItem details if needed
          },
        },
      },
    });

    if (!cart) return [];

    return cart.cartItems;
  }

  async findByCartAndMenuItem(cartId: string, menuItemId: string) {
    return await prisma.cartItem.findFirst({ where: { cartId, menuItemId } });
  }

  async createCartItem(
    cartItem: CreateCartItemDTO,
    cartId: string,
    customerId: string,
    itemDetails: { name: string; price: number }
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Cart Event
      await tx.cartEvent.create({
        data: {
          customerId,
          eventType: CartEventType.ADD_TO_CART,
          menuItemId: cartItem.menuItemId,
          itemName: itemDetails.name,
          quantity: cartItem.quantity,
          price: itemDetails.price,
        }
      });

      // 2. Upsert CartItem (Snapshot)
      return await tx.cartItem.upsert({
        where: {
          cartId_menuItemId: {
            cartId,
            menuItemId: cartItem.menuItemId,
          },
        },
        update: {
          quantity: cartItem.quantity,
          price: itemDetails.price,
        },
        create: {
          cartId,
          quantity: cartItem.quantity,
          menuItemId: cartItem.menuItemId,
          price: itemDetails.price,
        },
      });
    });
  }

  async updateCartItemQuantity({
    cartId,
    cartItemId,
    quantity,
    customerId // Added customerId for event
  }: UpdateQuantityDTO & { cartId: string, customerId: string }) {

    return await prisma.$transaction(async (tx) => {
      // 1. Create Event
      // We know the cart item exists if we are updating it, or the update will fail.
      // But we need the menuItemId for the event potentially?
      // For UPDATE_QUANTITY, usually we just need quantity. 
      // But let's fetch the item first to be safe and have full data if needed, or just log quantity.

      await tx.cartEvent.create({
        data: {
          customerId,
          eventType: CartEventType.UPDATE_QUANTITY,
          quantity: quantity,
          // price could be fetched if we want to log it again, but optional
        }
      });

      // 2. Update Snapshot
      return await tx.cartItem.update({
        where: { cartId, cartItemId },
        data: { quantity },
      });
    });
  }

  async clearCartByCustomerId(customerId: string) {
    const cart = await this.findCartByCustomerId(customerId);
    if (cart) {
      return this.clearCart(cart.cartId, customerId);
    }
  }

  async removeItemFromCart({ cartId, cartItemId, customerId }: RemoveCartItemDTO & { cartId: string, customerId: string }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch item to get details before deletion
      const item = await tx.cartItem.findUnique({
        where: { cartItemId, cartId } // Ensure it belongs to this cart
      });

      if (!item) {
        // Item already gone or doesn't exist, just return
        return null;
      }

      // 2. Create Event
      await tx.cartEvent.create({
        data: {
          customerId,
          eventType: CartEventType.REMOVE_FROM_CART,
          menuItemId: item.menuItemId,
          price: item.price
        }
      });

      // 3. Delete Snapshot
      return await tx.cartItem.delete({
        where: { cartItemId },
      });
    });
  }

  async clearCart(cartId: string, customerId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Event
      await tx.cartEvent.create({
        data: {
          customerId,
          eventType: CartEventType.CLEAR_CART,
        }
      });

      // 2. Delete All Items
      return await tx.cartItem.deleteMany({ where: { cartId } });
    });
  }

  async lockCart(customerId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.cartEvent.create({
        data: {
          customerId,
          eventType: CartEventType.LOCK_CART
        }
      });

      return await tx.cart.update({
        where: { customerId },
        data: { isLocked: true },
      });
    });
  }

  async unlockCart(customerId: string) {
    return await prisma.$transaction(async (tx) => {
      await tx.cartEvent.create({
        data: {
          customerId,
          eventType: CartEventType.UNLOCK_CART
        }
      });

      return await tx.cart.update({
        where: { customerId },
        data: { isLocked: false },
      });
    });
  }
}
export const cartRepository = new CartRepository();
