import { prisma } from "../config/prisma";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { cartRepository } from "../repositories/cart.repository";
import { cartItemRepository } from "../repositories/cartItem.repository";

export const cartService = {
   async addToCart(cartItem:CreateCartItemDTO , customerId:number) {
          // check customer have cart or no
           let cart = await cartRepository.findByCustomerId(customerId)
           if(!cart) {
              cart = await cartRepository.createCart(customerId)
           }
           const existingItem  = await cartItemRepository.findByCartAndMenuItem(cart.id , cartItem.menuItemId)
           let updateItem;
           if (existingItem) {
              const newQuantity  = existingItem.quantity + cartItem.quantity
              // TODO
            //   updateItem = await cartItemRepository.updateQuntity(existingItem.id , newQuantity)
           } else {
             updateItem = await cartItemRepository.create(cartItem , cart.id)
           }
           return {cart , item: updateItem}    
    }
}
