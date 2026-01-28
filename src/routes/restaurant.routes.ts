import express from "express";
import { validateRequest } from "../middleware/validate-request";
import {
  createRestaurantSchema,
  deleteRestaurantSchema,
  enableOrDisableRestaurantSchema,
  findRestaurantByRestaurantIdSchema,
  searchRestaurantSchema,
  updateRestaurantRatingSchema,
  updateRestaurantSchema,
} from "../validation/restaurant.schema";
import { restaurantController } from "../controllers/restaurant.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

export const restaurantRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Restaurant management endpoints
 */

/**
 * @swagger
 * /api/v1/restaurant:
 *   get:
 *     summary: Retrieve all restaurants
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: List of all restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.get('/', restaurantController.findAllRestaurants);

/**
 * @swagger
 * /api/v1/restaurant/user:
 *   get:
 *     summary: Get restaurant by User ID
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.get('/user', isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), restaurantController.findRestaurantByUserId);

/**
 * @swagger
 * /api/v1/restaurant/{restaurantId}:
 *   get:
 *     summary: Get restaurant by Restaurant ID
 *     description: Retrieve a restaurant by its ID. Note that the path parameter is currently ignored by the implementation, which expects `restaurantId` in the request body.
 *     tags: [Restaurant]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.get('/:restaurantId', validateRequest(findRestaurantByRestaurantIdSchema), restaurantController.findRestaurantByRestaurantId);

/**
 * @swagger
 * /api/v1/restaurant:
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - managerId
 *               - addressId
 *               - restaurantName
 *               - restaurantBio
 *               - restaurantLogo
 *             properties:
 *               managerId:
 *                 type: string
 *               addressId:
 *                 type: string
 *               restaurantName:
 *                 type: string
 *               restaurantBio:
 *                 type: string
 *               restaurantLogo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.post('/', isAuthenticated, validateRequest(createRestaurantSchema), restaurantController.createRestaurant);

/**
 * @swagger
 * /api/v1/restaurant/update:
 *   put:
 *     summary: Update restaurant details
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *               restaurantName:
 *                 type: string
 *               restaurantBio:
 *                 type: string
 *               restaurantLogo:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               addressId:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       202:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.put('/update', isAuthenticated, validateRequest(updateRestaurantSchema), restaurantController.updateRestaurant);

/**
 * @swagger
 * /api/v1/restaurant/update-rating:
 *   put:
 *     summary: Update restaurant rating
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - averageRating
 *               - ratingCount
 *             properties:
 *               restaurantId:
 *                 type: string
 *               averageRating:
 *                 type: number
 *               ratingCount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.put('/update-rating', isAuthenticated, validateRequest(updateRestaurantRatingSchema), restaurantController.updateRestaurantRating);

/**
 * @swagger
 * /api/v1/restaurant:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.delete('/', isAuthenticated, validateRequest(deleteRestaurantSchema), restaurantController.deleteRestaurant);

/**
 * @swagger
 * /api/v1/restaurant/enable-disable:
 *   put:
 *     summary: Enable or disable a restaurant
 *     tags: [Restaurant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Restaurant status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.put('/enable-disable', isAuthenticated, validateRequest(enableOrDisableRestaurantSchema), restaurantController.enableOrDisableRestaurant);

/**
 * @swagger
 * /api/v1/restaurant/search:
 *   get:
 *     summary: Search restaurants
 *     tags: [Restaurant]
 *     parameters:
 *       - in: query
 *         name: restaurantName
 *         schema:
 *           type: string
 *         description: Name of the restaurant to search for
 *     responses:
 *       200:
 *         description: List of matching restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
restaurantRouter.get('/search', validateRequest(searchRestaurantSchema, "query"), restaurantController.searchRestaurants);
