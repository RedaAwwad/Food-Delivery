import express from "express";
import { menuItemController } from "../controllers/menuItem.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import {
  createMenuItemSchema,
  deleteMenuItemSchema,
  updateMenuItemSchema,
} from "../validation/menuItem.schemas";

const menuItemRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: MenuItem
 *   description: Menu Item management endpoints
 */

/**
 * @swagger
 * /api/v1/menuItem/menu-category/{menuCategoryId}:
 *   get:
 *     summary: Get all menu items by Menu Category ID
 *     tags: [MenuItem]
 *     parameters:
 *       - in: path
 *         name: menuCategoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of menu items
 */
menuItemRouter.get("/menu-category/:menuCategoryId", menuItemController.getAllMenuItemByMenuCategoryId);

/**
 * @swagger
 * /api/v1/menu-items/restaurant/{restaurantId}:
 *   get:
 *     summary: Get orderable (active, in-stock) menu items for a restaurant
 *     tags: [MenuItem]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of orderable menu items
 */
menuItemRouter.get("/restaurant/:restaurantId", menuItemController.getOrderableItemsByRestaurantId);

/**
 * @swagger
 * /api/v1/menuItem/{menuItemId}:
 *   get:
 *     summary: Get menu item by ID
 *     tags: [MenuItem]
 *     parameters:
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Menu item details
 */
menuItemRouter.get("/:menuItemId", menuItemController.getMenuItemById);

/**
 * @swagger
 * /api/v1/menuItem:
 *   post:
 *     summary: Create a new menu item
 *     tags: [MenuItem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemName
 *               - menuItemDesc
 *               - menuItemImageUrl
 *               - price
 *               - stockQuantity
 *             properties:
 *               menuItemName:
 *                 type: string
 *               menuItemDesc:
 *                 type: string
 *               menuItemImageUrl:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Menu item created successfully
 */
menuItemRouter.post("/", isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), validateRequest(createMenuItemSchema), menuItemController.createMenuItem);

/**
 * @swagger
 * /api/v1/menuItem:
 *   put:
 *     summary: Update a menu item
 *     tags: [MenuItem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemName
 *               - menuItemDesc
 *               - menuItemImageUrl
 *               - price
 *               - stockQuantity
 *             properties:
 *               menuItemName:
 *                 type: string
 *               menuItemDesc:
 *                 type: string
 *               menuItemImageUrl:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 */
menuItemRouter.put("/", isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), validateRequest(updateMenuItemSchema), menuItemController.updateMenuItem);

/**
 * @swagger
 * /api/v1/menuItem:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [MenuItem]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *             properties:
 *               menuItemId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 */
menuItemRouter.delete("/", isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), validateRequest(deleteMenuItemSchema), menuItemController.deleteMenuItem);

/**
 * @swagger
 * /api/v1/menuItem/search:
 *   get:
 *     summary: Search menu items
 *     tags: [MenuItem]
 *     parameters:
 *       - in: query
 *         name: menuItemName
 *         schema:
 *           type: string
 *         description: Search by menu item name
 *     responses:
 *       200:
 *         description: List of matching menu items
 */
menuItemRouter.get("/search/:keyword", menuItemController.searchMenuItem);

export default menuItemRouter;

