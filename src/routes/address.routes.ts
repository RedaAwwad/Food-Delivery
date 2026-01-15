import express from "express";
import { addressController } from "../controllers/address.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const addressRouter = express.Router();

// Protect all address routes
addressRouter.use(isAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Address management APIs
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: "123 Main St"
 *               city:
 *                 type: string
 *                 example: "Riyadh"
 *               area:
 *                 type: string
 *                 example: "Olaya"
 *               zipCode:
 *                 type: integer
 *                 example: 12345
 *               block:
 *                 type: string
 *                 example: "A"
 *               apartmentNumber:
 *                 type: string
 *                 example: "101"
 *               floor:
 *                 type: string
 *                 example: "1"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 24.7136
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 46.6753
 *               isPrimary:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
addressRouter.post("/", addressController.createAddress);

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get all addresses for the logged-in customer
 *     tags: [Address]
 *     responses:
 *       200:
 *         description: List of addresses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
addressRouter.get("/", addressController.getMyAddresses);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   put:
 *     summary: Update an existing address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               zipCode:
 *                 type: integer
 *               block:
 *                 type: string
 *               apartmentNumber:
 *                 type: string
 *               floor:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
addressRouter.put("/:addressId", addressController.updateAddress);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Address]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *         description: The address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
addressRouter.delete("/:addressId", addressController.deleteAddress);

export { addressRouter };
