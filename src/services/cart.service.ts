import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { Cart } from "../generated/prisma";
import { cartRepository } from "../repositories/cart.repository";
import { CustomError } from "../utils/errors/custom-error";



class CartService {
   async addToCart(cartItem:CreateCartItemDTO , customerId:number) {
          // check customer have cart or no
           // const cartRepository = new cartRepository()
           let cart = await cartRepository.findByCustomerId(customerId)

           if(!cart) {
              cart = await cartRepository.createCart(customerId) as Cart
           }
           const existingItem  = await cartRepository.findByCartAndMenuItem(cart.id , cartItem.menuItemId)
           let updateItem;
           if (existingItem) {
              const newQuantity  = existingItem.quantity + cartItem.quantity
              // TODO
            //   updateItem = await cartItemRepository.updateQuntity(existingItem.id , newQuantity)
           } else {
             updateItem = await cartRepository.createItem(cartItem , cart.id)
           }
           return {cart , item: updateItem}    
    }
   async viewCart(customerId: number) {
       const cart = await cartRepository.findByCustomerId(customerId)
       if (!cart) {
          throw new CustomError({
            message: "Customer doesn't have a cart",
            statusCode: 404,
          });
       }
       return cart
   } 
}
export const cartService = new CartService()

