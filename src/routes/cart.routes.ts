import express from "express";
import { cartController } from "../controllers/cart.controller";
import { validateRequest } from "../middleware/validate-request";
import { AddToCartSchema } from "../validation/cart.schema";


const cartRouter = express.Router();



// add To Cart
cartRouter.post("/addToCart" , validateRequest(AddToCartSchema) ,  cartController.addToCart)

cartRouter.get("/" , cartController.viewCart)

cartRouter.put("/update-quantity", (req, res) => {
  const { quantity, itemId } = (req.body = {}) as {
    quantity: number;
    itemId: string;
  };
  res.json({ message: "Item quantity updated successfully" });
});

cartRouter.delete("/clear", (req, res) => {
  res.json({ message: "Cart has been cleared successfully" });
});

export { cartRouter };
