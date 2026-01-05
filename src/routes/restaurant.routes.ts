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
 * /api/v1/restaurant/menu-item/search:
 *   get:
 *     summary: Get all MenuItem searched
 *     tags: [Restaurant]
 *     parameters:
 *       - in: query
 *         name: menuItemName
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by menu item name
 *       - in: query
 *         name: menuItemDesc
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by menu item description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         required: false
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *           minimum: 0
 *         required: false
 *         description: Maximum price filter
 *     responses:
 *       200:
 *         description: List of menu items matching filters
 */

// restaurantRouter.get('/menu-item/search' , validateRequest(searchMenuItemSchema), restaurantController.searchMenuItems)