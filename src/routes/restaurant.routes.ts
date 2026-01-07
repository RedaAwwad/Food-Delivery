import express from 'express';
import { validateRequest } from '../middleware/validate-request';
import { createRestaurantSchema, deleteRestaurantSchema, enableOrDisableRestaurantSchema, findRestaurantByRestaurantIdSchema, searchRestaurantSchema, updateRestaurantRatingSchema, updateRestaurantSchema } from '../validation/restautant.schema';
import { restaurantController } from '../controllers/restaurant.controller';
import { authenticate } from '../middleware/auth.middleware';

export const restaurantRouter = express.Router()

restaurantRouter.get('/', restaurantController.findAllRestaurants);
restaurantRouter.get('/user', authenticate, restaurantController.findRestaurantByUserId);
restaurantRouter.get('/restaurant', validateRequest(findRestaurantByRestaurantIdSchema), restaurantController.findRestaurantByRestaurantId);
restaurantRouter.post('/', authenticate, validateRequest(createRestaurantSchema), restaurantController.createRestaurant);
restaurantRouter.put('/update', authenticate, validateRequest(updateRestaurantSchema), restaurantController.updateRestaurant);
restaurantRouter.put('/update-rating', authenticate, validateRequest(updateRestaurantRatingSchema), restaurantController.updateRestaurantRating);
restaurantRouter.delete('/', authenticate, validateRequest(deleteRestaurantSchema), restaurantController.deleteRestaurant);
restaurantRouter.put('/enable-disable', authenticate, validateRequest(enableOrDisableRestaurantSchema), restaurantController.enableOrDisableRestaurant);
restaurantRouter.get('/search', validateRequest(searchRestaurantSchema), restaurantController.searchRestaurants);


/**
 * @swagger
 * tags:
 *   name: Restaurant
 *   description: Restaurant management endpoints
 */

/**
 * @swagger
 * /restaurant:
 *   get:
 *     summary: Retrieve all restaurants
 *     tags: [Restaurant]
 *     responses:
 *       200:
 *         description: List of all restaurants
 *
 *   post:
 *     summary: Create a new restaurant
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
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
 *
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
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
 */

/**
 * @swagger
 * /restaurant/user:
 *   get:
 *     summary: Get restaurant by User ID
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant details
 */

/**
 * @swagger
 * /restaurant/restaurant:
 *   get:
 *     summary: Get restaurant by Restaurant ID
 *     tags: [Restaurant]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the restaurant to retrieve (Note: Schema uses body, but GET requests usually use query params. If your middleware expects body, document as such, but standard is query/path)
 *     requestBody:
 *       description: "Note: This endpoint expects restaurantId in the body based on validation schema, though GET with body is non-standard."
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
 */

/**
 * @swagger
 * /restaurant/update:
 *   put:
 *     summary: Update restaurant details
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
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
 */

/**
 * @swagger
 * /restaurant/update-rating:
 *   put:
 *     summary: Update restaurant rating
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
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
 */

/**
 * @swagger
 * /restaurant/enable-disable:
 *   put:
 *     summary: Enable or disable a restaurant
 *     tags: [Restaurant]
 *     security:
 *       - BearerAuth: []
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
 */

/**
 * @swagger
 * /restaurant/search:
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
 */
