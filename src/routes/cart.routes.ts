import express from "express";
import { cartController } from "../controllers/cart.controller";
import { validateRequest } from "../middleware/validate-request";
import {
  AddToCartSchema,
  UpdateQuantitySchema,
} from "../validation/cart.schema";

const cartRouter = express.Router();

cartRouter.get("/", (req, res) => {
  /**
   * #swagger.tags = ['Cart']
   * #swagger.summary = 'Customer view cart'
   * #swagger.responses[200] = { description: 'Customer View cart successfully' }
   * #swagger.responses[400] = { description: 'Cart not found' }
   */

  res.json({
    message: "Customer View cart successfully",
  });
});

// add To Cart
cartRouter.post(
  "/addToCart",
  validateRequest(AddToCartSchema),
  cartController.addToCart
);

cartRouter.put(
  "/update-quantity",
  validateRequest(UpdateQuantitySchema),
  cartController.updateQuantity
);

cartRouter.delete("/clear", (req, res) => {
  res.json({ message: "Cart has been cleared successfully" });
});

export { cartRouter };
