import {prisma} from "../config/prisma.config"
import { CreateCartItemDTO } from "../dto/cartItem.dto";

class CartRepository {
     async findByCustomerId(customerId:number) {
        return await prisma.cart.findUnique({where:{customerId}})
      } 

   async createCart(customerId: number) {
     try {
         const cart = await prisma.cart.create({data:{customerId}});
          return cart

     } catch (error) {
           console.log('err' , error)      
     }
  }
   async findByCartAndMenuItem(cartId:number , menuItemId:number) {
        return await prisma.cartItem.findFirst({where:{cartId , menuItemId }})
    }

    async createItem(cartItem:CreateCartItemDTO , cartId:number){
            return await prisma.cartItem.create({
                data:{
                    cartId ,
                    quantity:cartItem.quantity , 
                    menuItemId:cartItem.menuItemId , 
                    price:cartItem.price 
                }})
        }
}
export const cartRepository = new CartRepository()
