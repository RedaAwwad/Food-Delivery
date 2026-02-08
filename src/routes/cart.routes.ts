import express, { RequestHandler } from "express";
import { cartController } from "../controllers/cart.controller";
import { validateRequest } from "../middleware/validate-request";
import { CartEventSchema } from "../validation/cartEvent.schema";
import { isAuthenticated } from "../middleware/auth.middleware";

const cartRouter = express.Router();

// Apply auth to all role routes
cartRouter.use(isAuthenticated);

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
 *     security:
 *       - BearerAuth: []
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
 *                   type: object
 *                   properties:
 *                     cartId:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     isLocked:
 *                       type: boolean
 *                     cartItems:
 *                       type: array
 *                       items:
 *                         type: object
 */
cartRouter.get("/", cartController.getCartWithCartItemsByCustomerId as RequestHandler);

/**
 * @swagger
 * /api/v1/cart/add-cart-event:
 *   post:
 *     summary: Add a cart event (Add, Update, Remove, Clear)
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventType
 *             properties:
 *               eventType:
 *                 type: string
 *                 enum: [ADD_TO_CART, UPDATE_QUANTITY, REMOVE_FROM_CART, CLEAR_CART, LOCK_CART, UNLOCK_CART]
 *                 example: ADD_TO_CART
 *               menuItemId:
 *                 type: string
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Event handled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error or invalid event
 */
cartRouter.post("/add-cart-event", validateRequest(CartEventSchema), cartController.addCartEvent as RequestHandler);

/**
 * @swagger
 * /api/v1/cart/get-cart-events:
 *   get:
 *     summary: Get cart events history
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of cart events
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
 *                       eventType:
 *                         type: string
 *                       menuItemId:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       eventDate:
 *                         type: string
 *                         format: date-time
 */
cartRouter.get("/get-cart-events", cartController.getCartEvents as RequestHandler);

export { cartRouter };
