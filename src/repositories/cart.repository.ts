import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { RemoveCartItemDTO } from "../dto/RemoveCartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";

class CartRepository {
  async findByCustomerId(customerId: number) {
    // TODO: REVIEW | handle not found case
    // const cart = await prisma.cart.findUnique({ where: { customerId } });

    // if (!cart) {
    //   throw new CustomError({
    //     statusCode: 404,
    //     code: "ERR_NF",
    //     message: "Cart not found!",
    //   });
    // }

    // return cart;
    return await prisma.cart.findUnique({ where: { customerId } });
  }

   async createCart(customerId: number) {
     try {
         const cart = await prisma.cart.create({data:{customerId}});
          return cart

     } catch (error) {
           console.log('err' , error)      
     }
    }

  async findByCartAndMenuItem(cartId: number, menuItemId: number) {
    return await prisma.cartItem.findFirst({ where: { cartId, menuItemId } });
  }

  async createItem(cartItem: CreateCartItemDTO, cartId: number) {
    // TODO: REVIEW | adding upsert instead of create
    // return await prisma.user.upsert({
    //   where: { id: existingItemId },
    //   update: {
    //     quantity: cartItem.quantity,
    //     price: cartItem.price,
    //   },
    //   create: {
    //     cartId,
    //     quantity: cartItem.quantity,
    //     menuItemId: cartItem.menuItemId,
    //     price: cartItem.price,
    //   },
    // });

    return await prisma.cartItem.create({
      data: {
        cartId,
        quantity: cartItem.quantity,
        menuItemId: cartItem.menuItemId,
        price: cartItem.price,
      },
    });
  }

  async updateItemQuantity({
    cartId,
    itemId,
    quantity,
  }: UpdateQuantityDTO & { cartId: number }) {
    return await prisma.cartItem.update({
      where: { cartId, id: itemId },
      data: { quantity },
    });
  }

  async removeItemFromCart({
    itemId,
    cartId,
  }: RemoveCartItemDTO & { cartId: number }) {
    return await prisma.cartItem.delete({ where: { id: itemId, cartId } });
  }
}
export const cartRepository = new CartRepository();
