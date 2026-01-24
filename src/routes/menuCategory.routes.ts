import express from "express";
import { menuCategoryController } from "../controllers/menuCategory.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import {
  createMenuCategorySchema,
  deleteMenuCategorySchema,
  updateMenuCategorySchema,
} from "../validation/menuCategory.schema";

const menuCategoryRouter = express.Router();

menuCategoryRouter.get("/", menuCategoryController.findAllMenuCategoriesByMenuId);
menuCategoryRouter.post(
  "/",
  isAuthenticated,
  isAuthorized(["RESTAURANT_MANAGER"]),
  validateRequest(createMenuCategorySchema),
  menuCategoryController.createMenuCategory
);
menuCategoryRouter.put(
  "/",
  isAuthenticated,
  isAuthorized(["RESTAURANT_MANAGER"]),
  validateRequest(updateMenuCategorySchema),
  menuCategoryController.updateMenuCategory
);
menuCategoryRouter.delete(
  "/",
  isAuthenticated,
  isAuthorized(["RESTAURANT_MANAGER"]),
  validateRequest(deleteMenuCategorySchema),
  menuCategoryController.deleteMenuCategory
);

export { menuCategoryRouter };

/**
 * @swagger
 * tags:
 *   name: MenuCategory
 *   description: Menu Category management endpoints
 */

/**
 * @swagger
 * /menu-category:
 *   get:
 *     summary: Find all menu categories by Menu ID
 *     tags: [MenuCategory]
 *     requestBody:
 *       description: "Expects menuId in body (based on schema convention, though validation middleware is missing on route)"
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuId
 *             properties:
 *               menuId:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of menu categories
 *
 *   post:
 *     summary: Create a new menu category
 *     tags: [MenuCategory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuId
 *               - menuCategoryName
 *             properties:
 *               menuId:
 *                 type: string
 *               menuCategoryName:
 *                 type: string
 *               menuCategoryImageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu category created successfully
 *
 *   put:
 *     summary: Update a menu category
 *     tags: [MenuCategory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuCategoryId
 *             properties:
 *               menuCategoryId:
 *                 type: string
 *               menuCategoryName:
 *                 type: string
 *               menuCategoryImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu category updated successfully
 *
 *   delete:
 *     summary: Delete a menu category
 *     tags: [MenuCategory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
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
 *         description: Menu category deleted successfully
 */
