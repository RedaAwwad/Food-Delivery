import express from "express";
import { customerController } from "../controllers/customer.controller";

const customerRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/v1/customers/{customer_id}/orders:
 *   get:
 *     summary: Get customer orders
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: List of customer orders
 */
customerRouter.get("/:customer_id/orders", customerController.getCustomerOrders);

/**
 * @swagger
 * /api/v1/customers/{customer_id}/orders/:order_id:
 *   get:
 *     summary: Get customer order details by orderId
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: customer_id of the customer
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: order_id of the customer order
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 *       404:
 *         description: Customer not found
 */
customerRouter.get("/:customer_id/orders/:order_id", customerController.getCustomerOrderDetails);

customerRouter.patch("/:customer_id/deactivate", customerController.deactivateAccount);

export { customerRouter };
