import express from "express";
import { orderController } from "../controllers/order.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

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
 *         name: id
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
 *               statusId:
 *                 type: string
 *                 description: The new status ID of the order
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
  "/:id/status",
  isAuthorized(["restaurant", "admin"]),
  orderController.updateStatus
);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   patch:
 *     summary: cancell order by Customer or restuarent
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
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
 *               statusId:
 *                 type: string
 *                 description: The new status ID of the order
 *             required:
 *               - statusId
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
orderRouter.patch("/:id/cancel", isAuthorized(["restaurant"]), orderController.cancelOrder);

orderRouter.post("/check-out", orderController.placeOrder);

export { orderRouter };
