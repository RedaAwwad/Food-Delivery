import { Request, Response ,NextFunction  } from "express";
import { cartService } from "../services/cart.service";
import { CreateCartItemDTO } from "../dto/cartItem.dto";
import { UpdateQuantityDTO } from "../dto/UpdateQuantity.dto";

class CartController {
     async addToCart(req:Request<{} , {} , CreateCartItemDTO> ,  res:Response , next:NextFunction) {
          const customerId = 1 // TODO -When create Token , auth
          // TODO make-validation
         
          const cart =  await cartService.addToCart(req.body ,  customerId)
          res.status(201).json({success:true , data:cart})
    }
    async viewCart(req:Request , res:Response) {
        const customerId = 1  // TODO -When create Token , auth
        const cart = await cartService.viewCart(customerId)

        res.status(200).json({success:true , data:cart})
    }

  async updateQuantity(req: Request<{}, {}, UpdateQuantityDTO>, res: Response) {
    const updatedItem = await cartService.updateQuantity(req.body);
    res.status(200).json({ success: true, data: updatedItem });
  }
}
export const cartController = new CartController();
