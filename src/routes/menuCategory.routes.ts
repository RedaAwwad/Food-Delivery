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

/**
 * @swagger
 * tags:
 *   name: MenuCategory
 *   description: Menu Category management endpoints
 */

/**
 * @swagger
 * /api/v1/menuCategory:
 *   get:
 *     summary: Find all menu categories by Menu ID
 *     tags: [MenuCategory]
 *     requestBody:
 *       description: "Expects menuId in body"
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
 */
menuCategoryRouter.get("/", menuCategoryController.findAllMenuCategoriesByMenuId);

/**
 * @swagger
 * /api/v1/menuCategory:
 *   post:
 *     summary: Create a new menu category
 *     tags: [MenuCategory]
 *     security:
 *       - bearerAuth: []
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
 */
menuCategoryRouter.post("/", isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), validateRequest(createMenuCategorySchema), menuCategoryController.createMenuCategory);

/**
 * @swagger
 * /api/v1/menuCategory:
 *   put:
 *     summary: Update a menu category
 *     tags: [MenuCategory]
 *     security:
 *       - bearerAuth: []
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
 */
menuCategoryRouter.put("/", isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), validateRequest(updateMenuCategorySchema), menuCategoryController.updateMenuCategory);

/**
 * @swagger
 * /api/v1/menuCategory:
 *   delete:
 *     summary: Delete a menu category
 *     tags: [MenuCategory]
 *     security:
 *       - bearerAuth: []
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
menuCategoryRouter.delete("/", isAuthenticated, isAuthorized(["RESTAURANT_MANAGER"]), validateRequest(deleteMenuCategorySchema), menuCategoryController.deleteMenuCategory);

export { menuCategoryRouter };
