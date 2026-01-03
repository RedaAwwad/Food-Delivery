import express from "express";
import { validateRequest } from "../middleware/validate-request";
import { getRestaurantSchema, searchMenuItemSchema } from "../validation/restaurant.schema";
import { restaurantController } from "../controllers/restaurant.controller";
export const restaurantRouter = express.Router();

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
restaurantRouter.get(
  "/menu-item/search",
  validateRequest(searchMenuItemSchema),
  restaurantController.searchMenuItems
);


restaurantRouter.get(
  "/:restaurantId",
  validateRequest(getRestaurantSchema),
  restaurantController.findRestaurantByRestaurantId
);
