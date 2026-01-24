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

menuItemRouter.get(
  "/menu-category/:menuCategoryId",
  menuItemController.getAllMenuItemByMenuCategoryId
);
menuItemRouter.get("/:menuItemId", menuItemController.getMenuItemById);
menuItemRouter.post(
  "/",
  isAuthenticated,
  isAuthorized(["RESTAURANT_MANAGER"]),
  validateRequest(createMenuItemSchema),
  menuItemController.createMenuItem
);
menuItemRouter.put(
  "/",
  isAuthenticated,
  isAuthorized(["RESTAURANT_MANAGER"]),
  validateRequest(updateMenuItemSchema),
  menuItemController.updateMenuItem
);
menuItemRouter.delete(
  "/",
  isAuthenticated,
  isAuthorized(["RESTAURANT_MANAGER"]),
  validateRequest(deleteMenuItemSchema),
  menuItemController.deleteMenuItem
);
menuItemRouter.get("/search/:keyword", menuItemController.searchMenuItem);

export default menuItemRouter;

/**
 * @swagger
 * tags:
 *   name: MenuItem
 *   description: Menu Item management endpoints
 */

/**
 * @swagger
 * /menu-item:
 *   get:
 *     summary: Get all menu items by Menu Category ID
 *     tags: [MenuItem]
 *     requestBody:
 *       description: "Expects menuCategoryId in body (based on schema convention)"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuCategoryId
 *             properties:
 *               menuCategoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of menu items
 *
 *   post:
 *     summary: Create a new menu item
 *     tags: [MenuItem]
 *     security:
 *       - BearerAuth: []
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
 *
 *   put:
 *     summary: Update a menu item
 *     tags: [MenuItem]
 *     security:
 *       - BearerAuth: []
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
 *
 *   delete:
 *     summary: Delete a menu item
 *     tags: [MenuItem]
 *     security:
 *       - BearerAuth: []
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

/**
 * @swagger
 * /menu-item/search:
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
