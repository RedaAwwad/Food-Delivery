import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";

class CartRepository {
  async findCartByCustomerId(customerId: number) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    return cart;
  }

  async upsertCart(customerId: number) {
    return await prisma.cart.upsert({
      where: { customerId },
      update: {},
      create: { customerId },
      include: {},
    });
  }

  async getCartItemsByCustomerId(customerId: number) {
    const cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: {
            menuItem: true, // Include menuItem details if needed
          },
        },
      },
    });

    if (!cart) {
      return [];
    }

    return cart.items;
  }

  async findByCartAndMenuItem(cartId: number, menuItemId: number) {
    return await prisma.cartItem.findFirst({ where: { cartId, menuItemId } });
  }

  async createCartItem(cartItem: CreateCartItemDTO, cartId: number) {
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
  }: UpdateQuantityDTO & { cartId: number }) {
    return await prisma.cartItem.update({
      where: { cartId, id: cartItemId },
      data: { quantity },
    });
  }

    async clearCartByCustomerId(customerId: number) {
    const cart = await this.findCartByCustomerId(customerId);
    if (cart) {
      return this.clearCart(cart.id);
    }
  }

  async removeItemFromCart({ cartId, itemId }: RemoveCartItemDTO & { cartId: number }) {
    return await prisma.cartItem.delete({
      where: { id: itemId, cartId },
    });
  }

  async clearCart(cartId: number) {
    return await prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

    async lockCart(customerId: number) {
    return await prisma.cart.update({
      where: { customerId },
      data: { isLocked: true },
    });
  }

  async unlockCart(customerId: number) {
    return await prisma.cart.update({
      where: { customerId },
      data: { isLocked: false },
    });
  }
}
export const cartRepository = new CartRepository();
