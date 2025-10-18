import { NextFunction, Request, Response } from "express";
import { cartService } from "../services/cart.service";
import { CreateCartItemDTO } from "../dto/cartItem.dto";

export const cartController = {
      async addToCart(req:Request<{} , {} , CreateCartItemDTO> ,  res:Response , next:NextFunction) {
          const customerId = 1 // TODO -When create Token
          // TODO make-validation
          const cart =  await cartService.addToCart(req.body ,  customerId)
          res.status(201).json({success:true , data:cart})
    }
}