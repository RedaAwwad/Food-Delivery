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

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: View cart items
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: List of cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 123
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       price:
 *                         type: number
 *                         example: 49.99
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart not found!
 */
cartRouter.get("/", cartController.viewCart);

/**
 * @swagger
 * /api/v1/cart/add-to-cart:
 *   post:
 *     summary: Add an item to cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *
 *     responses:
 *       201:
 *         description: Item added to cart
 */
cartRouter.post(
  "/add-to-cart",
  validateRequest(AddToCartSchema),
  cartController.addToCart
);

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
  "/update-quantity",
  validateRequest(UpdateQuantitySchema),
  cartController.updateQuantity
);

/**
 * @swagger
 * /api/v1/cart/remove-item:
 *   delete:
 *     summary: Clear item from the cart
 *     tags: [Cart]
 *     responses:
 *       204:
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
  "/remove-item",
  validateRequest(RemoveCartItemSchema),
  cartController.removeCartItem
);

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Clear all items in the cart
 *     tags: [Cart]
 *     responses:
 *       204:
 *         messages:
 *          - Cart cleared successfully
 *       404:
 *         messages:
 *           - Cart not found!
 *
 */
cartRouter.delete("/clear", cartController.clearCart);

export { cartRouter };
