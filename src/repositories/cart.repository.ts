import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { NotFoundError } from "../utils/errors";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "../generated/prisma";

class CartRepository {
  async findCartByCustomerId(customerId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw NotFoundError("No Cart Yet; Add Some Items");
    return cart;
  }

  async findCartIdByCustomerId(customerId: string) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      select: { cartId: true }
    });
    if (!cart) throw NotFoundError("No Cart Yet; Add Some Items");
    return cart.cartId;
  }

  async updateCartItemQuantityByCartIdAndMenuItemId(
    cartId: string,
    menuItemId: string,
    quantity: number,
    tx: PrismaTx = prisma
  ) {
    return await tx.cartItem.update({
      where: {
        cartId_menuItemId: {
          cartId,
          menuItemId
        }
      },
      data: { quantity }
    });
  }

  async removeCartItemByCartIdAndMenuItemId(
    cartId: string,
    menuItemId: string,
    tx: PrismaTx = prisma
  ) {
    return await tx.cartItem.delete({
      where: {
        cartId_menuItemId: {
          cartId,
          menuItemId
        }
      }
    });
  }

  async upsertCart(customerId: string, tx: PrismaTx | PrismaClient = prisma) {
    return await tx.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      include: {},
    });
  }

  async getCartWithCartItemsByCustomerId(customerId: string, tx: PrismaTx | PrismaClient = prisma) {
    return await tx.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      select: {
        cartItems: {
          select: {
            menuItemId: true,
            quantity: true,
            price: true,
          },
        },
        cartId: true,
      }
    });
  }

  async findCartItemByCartIdAndMenuItemId(cartId: string, menuItemId: string) {
    const cartItem = await prisma.cartItem.findFirst({ where: { cartId, menuItemId } });
    if (!cartItem) throw NotFoundError("Cart Item not found");
    return cartItem;
  }

  async createCartItem(
    cartItem: CreateCartItemDTO,
    cartId: string,
    itemDetails: { name: string; price: number },
    tx: PrismaTx = prisma
  ) {
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
  }

  async clearCart(cartId: string, tx: PrismaTx = prisma) {
    return await tx.cartItem.deleteMany({ where: { cartId } });
  }

  async lockCart(customerId: string, tx: PrismaTx = prisma) {
    return await tx.cart.update({
      where: { customerId },
      data: { isLocked: true },
    });
  }

  async unlockCart(customerId: string, tx: PrismaTx = prisma) {
    return await tx.cart.update({
      where: { customerId },
      data: { isLocked: false },
    });
  }
}
export const cartRepository = new CartRepository();
