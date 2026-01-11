import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO, UpdateCartItemQuantityDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { NotFoundError } from "../utils/errors";
import { PrismaTx } from "../types/prisma.types";

class CartRepository {
  async findCartByCustomerId(customerId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (!cart) throw NotFoundError("No Cart Yet; Add Some Items");
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

  async getCartWithCartItemsByCustomerId(customerId: string) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      select: {
        cartId: true,
        customerId: true,
        isLocked: true,
        cartItems: true
      }
    });

    if (!cart) return [];

    return cart;
  }

  async getCartWithOneCartItemByCustomerIdAndCartItemId(customerId: string, cartItemId: string) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      select: {
        cartId: true,
        customerId: true,
        isLocked: true,
        cartItems: {
          where: { cartItemId }
        }
      }
    });

    if (!cart) return null;

    return cart;
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

  async updateCartItemQuantity({
    cartItemId,
    quantity,
  }: UpdateCartItemQuantityDTO, tx: PrismaTx = prisma) {

    return await tx.cartItem.update({
      where: { cartItemId },
      data: { quantity },
    });
  }

  async removeItemFromCart({ cartItemId }: RemoveCartItemDTO, cartId: string, tx: PrismaTx = prisma) {
    return await tx.cartItem.delete({
      where: { cartItemId, cartId },
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
