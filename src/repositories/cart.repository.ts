import { prisma } from "../config/prisma";
import { CreateCartItemDTO } from "../dto/cartItem.dto";

export const cartRepository = {
    async findByCustomerId(customerId:number) {
        return await prisma.cart.findUnique({where:{customerId}})
    } ,

   async createCart(customerId: number) {
    return await prisma.cart.create({data:{customerId}});
  }
}