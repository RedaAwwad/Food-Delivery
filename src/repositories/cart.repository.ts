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
    });
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

  async removeItemFromCart({
    cartId,
    itemId,
  }: RemoveCartItemDTO & { cartId: number }) {
    return await prisma.cartItem.delete({
      where: { id: itemId, cartId },
    });
  }
  
  async clearCart(cartId: number) {
    return await prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async findCartById(cartId: number) {
    return prisma.cart.findUnique({
      where: { id: cartId },
    });
  }
}
export const cartRepository = new CartRepository();
