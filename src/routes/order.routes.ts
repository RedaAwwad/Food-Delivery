import express from "express";
import { orderController } from "../controllers/order.controller";

const orderRouter = express.Router();

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

export { orderRouter };
