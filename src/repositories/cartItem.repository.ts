import { prisma } from "../config/prisma";
import { CreateCartItemDTO } from "../dto/cartItem.dto";

export const cartItemRepository = {
    async create(cartItem:CreateCartItemDTO , cartId:number){
        return await prisma.cartItem.create({
            data:{
                cartId ,
                quantity:cartItem.quantity , 
                menuItemId:cartItem.menuItemId , 
                price:cartItem.price 
            }})
    },
    async findByCartAndMenuItem(cartId:number , menuItemId:number) {
        return await prisma.cartItem.findFirst({where:{cartId , menuItemId }})
    }
}