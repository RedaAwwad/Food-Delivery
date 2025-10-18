import { NextFunction, Request, Response } from "express";
import { cartService } from "../services/cart.service";
import { CreateCartItemDTO } from "../dto/cartItem.dto";


class CartController {
     async addToCart(req:Request<{} , {} , CreateCartItemDTO> ,  res:Response , next:NextFunction) {
          const customerId = 1 // TODO -When create Token , auth
          // TODO make-validation
         
          const cart =  await cartService.addToCart(req.body ,  customerId)
          res.status(201).json({success:true , data:cart})
    }
}
export const cartController = new CartController()
