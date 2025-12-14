import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";

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

  async createCartItem(cartItem: CreateCartItemDTO, cartId: string) {
    return await prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: {
          cartId,
          menuItemId: cartItem.menuItemId,
        },
      },
      update: {
        quantity: cartItem.quantity,
        price: cartItem.price,
      },
      create: {
        cartId,
        quantity: cartItem.quantity,
        menuItemId: cartItem.menuItemId,
        price: cartItem.price,
      },
    });
  }

  async updateCartItemQuantity({
    cartId,
    cartItemId,
    quantity,
  }: UpdateQuantityDTO & { cartId: string }) {
    return await prisma.cartItem.update({
      where: { cartId, cartItemId },
      data: { quantity },
    });
  }

  async clearCartByCustomerId(customerId: string) {
    const cart = await this.findCartByCustomerId(customerId);
    if (cart) {
      return this.clearCart(cart.cartId);
    }
  }

  async removeItemFromCart({ cartId, cartItemId }: RemoveCartItemDTO & { cartId: string }) {
    return await prisma.cartItem.delete({
      where: { cartItemId, cartId },
    });
  }

  async clearCart(cartId: string) {
    return await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async lockCart(customerId: string) {
    return await prisma.cart.update({
      where: { customerId },
      data: { isLocked: true },
    });
  }

  async unlockCart(customerId: string) {
    return await prisma.cart.update({
      where: { customerId },
      data: { isLocked: false },
    });
  }
}
export const cartRepository = new CartRepository();
