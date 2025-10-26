import express from "express";
import { cartController } from "../controllers/cart.controller";
import { validateRequest } from "../middleware/validate-request";
import {
  AddToCartSchema,
  UpdateQuantitySchema,
} from "../validation/cart.schema";

const cartRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management APIs
 */

/**
 * @swagger
 * /api/v1/cart/addToCart:
 *   post:
 *     summary: Add an item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCart'
 *     responses:
 *       200:
 *         description: Item added to cart
 */
cartRouter.post(
  "/addToCart",
  validateRequest(AddToCartSchema),
  cartController.addToCart
);

// add To Cart
cartRouter.post("/add-to-cart", validateRequest(AddToCartSchema), cartController.addToCart)

cartRouter.get("/", cartController.viewCart)

cartRouter.put("/update-quantity", (req, res) => {
  const { quantity, itemId } = (req.body = {}) as {
    quantity: number;
    itemId: string;
  };
  res.json({ message: "Item quantity updated successfully" });
});


/**
 * @swagger
 * /api/v1/cart/update-quantity:
 *   put:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuantity'
 *     responses:
 *       200:
 *         description: Quantity updated
 */
cartRouter.put(
  "/update-quantity",
  validateRequest(UpdateQuantitySchema),
  cartController.updateQuantity
);

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Clear all items in the cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
cartRouter.delete("/clear", cartController.clearCart);


export { cartRouter };
