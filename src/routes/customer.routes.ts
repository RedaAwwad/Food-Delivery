import express from "express";
import { customerController } from "../controllers/customer.controller";
import { isAdmin } from "../middleware/is-admin";

const customerRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management APIs
 */

/*
 - all customer => for admin
 - restaurant customers => for restaurant
*/

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Get all customers by admin
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: List of all customers
 */
customerRouter.get("/", isAdmin, customerController.getCustomersByAdmin);

/**
 * @swagger
 * /api/v1/customers/{customer_id}:
 *   get:
 *     summary: Get customer details by ID
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: customer_id
 *         required: true
 *         schema:
 *           type: string
 *         description: customer_id of the customer to retrieve
 *     responses:
 *       200:
 *         description: Customer details retrieved successfully
 *       404:
 *         description: Customer not found
 */
customerRouter.get("/:customer_id", isAdmin, customerController.getCustomerDetailsById);

export { customerRouter };
