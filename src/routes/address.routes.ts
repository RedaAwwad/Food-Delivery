import express from "express";
import { addressController } from "../controllers/address.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

const addressRouter = express.Router();

addressRouter.use(isAuthenticated);
addressRouter.use(isAuthorized(["CUSTOMER"]));

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: Address management endpoints
 */

/**
 * @swagger
 * /api/v1/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Address]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - city
 *               - area
 *               - zipCode
 *               - block
 *               - apartmentNumber
 *               - floor
 *               - latitude
 *               - longitude
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               area:
 *                 type: string
 *               zipCode:
 *                 type: string
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
 *               restaurantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Address created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 */
addressRouter.post("/", addressController.createAddress);

/**
 * @swagger
 * /api/v1/addresses:
 *   get:
 *     summary: Get my addresses
 *     tags: [Address]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Address'
 */
addressRouter.get("/", addressController.getMyAddresses);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   put:
 *     summary: Update an address
 *     tags: [Address]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
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
 *                 type: string
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 */
addressRouter.put("/:addressId", addressController.updateAddress);

/**
 * @swagger
 * /api/v1/addresses/{addressId}:
 *   delete:
 *     summary: Delete an address
 *     tags: [Address]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 */
addressRouter.delete("/:addressId", addressController.deleteAddress);

export { addressRouter };
