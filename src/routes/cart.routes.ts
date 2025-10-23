import express from "express";
import { cartController } from "../controllers/cart.controller";
import { validateRequest } from "../middleware/validate-request";
import {
  AddToCartSchema,
  RemoveCartItemSchema,
  UpdateQuantitySchema,
} from "../validation/cart.schema";

const cartRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management APIs
 */

cartRouter.get("/", cartController.viewCart);

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
  "/add-to-cart",
  validateRequest(AddToCartSchema),
  cartController.addToCart
);

/**
 * @swagger
 * /api/v1/carts/{cartId}/update-quantity:
 *   put:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *     responses:
 *       200:
 *       messages:
 *         - Cart item quantity updated successfully
 *       404:
 *         messages:
 *           - Cart item not found!
 *       422:
 *         messages:
 *           - Item ID is required
 *           - Quantity is required and must be at least 1
 */
cartRouter.put(
  "{cartId}/update-quantity",
  validateRequest(UpdateQuantitySchema),
  cartController.updateQuantity
);

/**
 * @swagger
 * /api/v1/carts/{cartId}/remove-item:
 *   delete:
 *     summary: Clear item from the cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *       messages:
 *         - Cart item cleared successfully
 *       404:
 *         messages:
 *           - Cart item not found!
 *       422:
 *         messages:
 *           - Item ID is required
 */
cartRouter.put(
  "{cartId}/remove-item",
  validateRequest(RemoveCartItemSchema),
  cartController.removeCartItem
);

/**
 * @swagger
 * /api/v1/carts/clear:
 *   delete:
 *     summary: Clear all items in the cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */
cartRouter.delete("/clear", (req, res) => {
  res.json({ message: "Cart has been cleared successfully" });
});

export { cartRouter };
