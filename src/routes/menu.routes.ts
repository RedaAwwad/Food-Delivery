import express from "express";
import { menuController } from "../controllers/menu.controller";
import { authenticate, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import { createMenuSchema, deleteMenuSchema, enableOrDisableMenuSchema, getActiveMenuSchema, updateMenuSchema, viewHistoryListOfRestaurantMenusSchema } from "../validation/menu.schema";

const menuRouter = express.Router();

menuRouter.get("/", validateRequest(getActiveMenuSchema), menuController.getActiveMenuByRestaurantId);
menuRouter.post("/", authenticate, isAuthorized(["Owner"]), validateRequest(createMenuSchema), menuController.createMenu);
menuRouter.put("/", authenticate, isAuthorized(["Owner"]), validateRequest(updateMenuSchema), menuController.updateMenu);
menuRouter.delete("/", authenticate, isAuthorized(["Owner"]), validateRequest(deleteMenuSchema), menuController.deleteMenu);
menuRouter.patch("/", authenticate, isAuthorized(["Owner"]), validateRequest(enableOrDisableMenuSchema), menuController.enableOrDisableMenu);
menuRouter.get("/all-menus", authenticate, isAuthorized(["Owner"]), validateRequest(viewHistoryListOfRestaurantMenusSchema), menuController.viewHistoryListOfRestaurantMenus);

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management endpoints
 */

/**
 * @swagger
 * /menu:
 *   get:
 *     summary: Get active menu by Restaurant ID
 *     tags: [Menu]
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
 *         description: Active menu details
 * 
 *   post:
 *     summary: Create a new menu
 *     tags: [Menu]
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
 *               - menuDesc
 *               - isActive
 *             properties:
 *               restaurantId:
 *                 type: string
 *               menuDesc:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu created successfully
 * 
 *   put:
 *     summary: Update a menu
 *     tags: [Menu]
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
 *               - menuDesc
 *               - isActive
 *             properties:
 *               menuId:
 *                 type: string
 *               menuDesc:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Menu updated successfully
 * 
 *   delete:
 *     summary: Delete a menu
 *     tags: [Menu]
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
 *             properties:
 *               menuId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 * 
 *   patch:
 *     summary: Enable or disable a menu
 *     tags: [Menu]
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
 *             properties:
 *               menuId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu status updated
 */

/**
 * @swagger
 * /menu/all-menus:
 *   get:
 *     summary: View history list of restaurant menus
 *     tags: [Menu]
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
 *         description: List of restaurant menus
 */

export { menuRouter }