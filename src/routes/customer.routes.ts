import express from "express";
import { customerController } from "../controllers/customer.controller";
import { validateRequest } from "../middleware/validate-request";
import { createCustomerRatingSchema } from "../validation/customer.schema";
import { isAuthorized, isAuthenticated } from "../middleware/auth.middleware";

const customerRouter = express.Router();

// Apply auth to all role routes
customerRouter.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Customer
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/v1/customers/orders:
 *   get:
 *     summary: Get customer orders
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: List of customer orders
 */
customerRouter.get("/orders", customerController.getCustomerOrdersByCustomerId);

/**
 * @swagger
 * /api/v1/customers/orders/{order_id}:
 *   get:
 *     summary: Get customer order details by orderId
 *     tags: [Customer]
 *     parameters:
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
customerRouter.get("/orders/:order_id", customerController.findCustomerOrderByCustomerId);

/**
 * @swagger
 * /api/v1/customers/deactivate:
 *   patch:
 *     summary: Deactivate customer account
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: Customer account deactivated successfully
 */
customerRouter.patch("/deactivate", customerController.deactivateAccount);

/**
 * @swagger
 * /api/v1/customers/rating:
 *   post:
 *     summary: Create rating for a restaurant by customer
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 example: "123"
 *               ratingScore:
 *                 type: string
 *                 enum: [ONE, TWO, THREE, FOUR, FIVE]
 *                 example: FOUR
 *               review:
 *                 type: string
 *                 example: "Great food and service!"
 *             required:
 *               - restaurantId
 *               - ratingScore
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Invalid input or missing parameters
 *       404:
 *         description: Restaurant not found
 *       500:
 *         description: Internal server error
 */
customerRouter.post(
  "/rating",
  validateRequest(createCustomerRatingSchema),
  isAuthorized(["CUSTOMER"]),
  customerController.createRatingByCustomer
);

// Address Routes
/**
 * @swagger
 * /api/v1/customers/addresses:
 *   post:
 *     summary: Create address
 *     tags: [Customer]
 *     responses:
 *       201:
 *         description: Address created
 */
customerRouter.post("/addresses", customerController.createAddress);

/**
 * @swagger
 * /api/v1/customers/addresses:
 *   get:
 *     summary: Get my addresses
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: List of addresses
 */
customerRouter.get("/addresses", customerController.getMyAddresses);

/**
 * @swagger
 * /api/v1/customers/addresses/{addressId}:
 *   put:
 *     summary: Update address
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address updated
 */
customerRouter.put("/addresses/:addressId", customerController.updateAddress);

/**
 * @swagger
 * /api/v1/customers/addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted
 */
customerRouter.delete("/addresses/:addressId", customerController.deleteAddress);

export { customerRouter };
