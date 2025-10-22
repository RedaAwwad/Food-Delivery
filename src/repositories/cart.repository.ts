import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.config";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";
import { CustomError } from "../utils/errors/custom-error";

class CartRepository {
   async findCartByCustomerId(customerId: number) {
      const cart =  await prisma.cart.findUnique({ where: { customerId } });
      return cart;
   }
   async upsertCart(customerId: number) {
      return await prisma.cart.upsert({
        where:{customerId},
        update:{} , 
        create:{customerId}
      })
   }



  async findByCartAndMenuItem(cartId: number, menuItemId: number) {
    return await prisma.cartItem.findFirst({ where: { cartId, menuItemId } });
  }

  async createItem(cartItem: CreateCartItemDTO, cartId: number) {
      return await prisma.cartItem.upsert({
        where:{
          cartId_menuItemId:{
          cartId , 
          menuItemId:cartItem.menuItemId
        }},
        update:{
          quantity:cartItem.quantity , 
          price:cartItem.price 
        } , 
        create:{
           cartId , 
           quantity:cartItem.quantity , 
           menuItemId:cartItem.menuItemId , 
           price:cartItem.price
        }
      })
    
    //   data: {
    //     cartId,
    //     quantity: cartItem.quantity,
    //     menuItemId: cartItem.menuItemId,
    //     price: cartItem.price,
    //   },
    // });
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


}
export const cartRepository = new CartRepository();
