import express from "express";
import { orderController } from "../controllers/order.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { isRestaurantManager } from "../middleware/restaurant.middleware";
import { validateRequest } from "../middleware/validate-request";
import { updateOrderStatusSchema } from "../validation/orderValidation.schema";

const orderRouter = express.Router();

// Apply auth to all role routes
orderRouter.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: List of all orders
 */
orderRouter.get("/", orderController.getAllOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       404:
 *         description: Order not found
 */
orderRouter.get("/:id", orderController.getOrderDetails);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: orderId of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatusKey:
 *                 type: string
 *                 description: The new orderStatusKey ID of the order
 *             required:
 *               - statusId
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid input or missing parameters
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.patch(
  "/:orderId/status",
  [isAuthenticated , isRestaurantManager],
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatusByRestaurant
);

/**
 * @swagger
 * /api/v1/orders/{orderId}/cancelOrder:
 *   patch:
 *     summary: cancell order by restuarent
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderstatusKey:
 *                 type: string
 *                 description: The new orderStatusKey of the order
 *             required:
 *               - orderstatusKey
 *     responses:
 *       200:
 *         description: Order status cancell successfully
 *       400:
 *         description: Invalid input or missing parameters
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
orderRouter.patch("/:orderId/cancelOrder", [isAuthenticated , isRestaurantManager], orderController.cancelOrder);

orderRouter.post("/check-out", orderController.placeOrder);

export { orderRouter };
