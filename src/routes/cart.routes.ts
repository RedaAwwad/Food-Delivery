import express from "express";
import { validateRequest } from "../middleware/validate-request";
import { AddToCartSchema } from "../validation/cart.schema";

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

cartRouter.post("/add", validateRequest(AddToCartSchema), (req, res) => {
  res.json({ message: "Item added successfully" });
});

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
