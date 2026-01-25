import express from "express";
import { menuController } from "../controllers/menu.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import { createMenuSchema, deleteMenuSchema, enableOrDisableMenuSchema, getActiveMenuSchema, updateMenuSchema, viewHistoryListOfRestaurantMenusSchema } from "../validation/menu.schema";

const menuRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management endpoints
 */

/**
 * @swagger
 * /api/v1/menu/{menuId}:
 *   get:
 *     summary: Get active menu by Restaurant ID
 *     description: Retrieve the active menu for a specific restaurant. Note that the `menuId` path parameter is currently unused by the implementation, but required by the route pattern. The `restaurantId` must be provided in the request body.
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: menuId
 *         required: true
 *         schema:
 *           type: string
 *         description: Placeholder ID (unused)
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
 *                 example: "rest_123"
 *     responses:
 *       200:
 *         description: Active menu details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Bad Request (e.g. Menu not found)
 */
menuRouter.get("/:menuId", validateRequest(getActiveMenuSchema), menuController.getActiveMenuByRestaurantId);

/**
 * @swagger
 * /api/v1/menu:
 *   post:
 *     summary: Create a new menu
 *     tags: [Menu]
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
 *               - menuDesc
 *               - isActive
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 example: "rest_123"
 *               menuDesc:
 *                 type: string
 *                 example: "Lunch Menu"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Bad Request
 */
menuRouter.post("/", isAuthenticated, isAuthorized(["Owner"]), validateRequest(createMenuSchema), menuController.createMenu);

/**
 * @swagger
 * /api/v1/menu:
 *   put:
 *     summary: Update a menu
 *     tags: [Menu]
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
 *               - menuDesc
 *               - isActive
 *             properties:
 *               menuId:
 *                 type: string
 *                 example: "menu_123"
 *               menuDesc:
 *                 type: string
 *                 example: "Updated Lunch Menu"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Bad Request
 */
menuRouter.put("/", isAuthenticated, isAuthorized(["Owner"]), validateRequest(updateMenuSchema), menuController.updateMenu);

/**
 * @swagger
 * /api/v1/menu:
 *   delete:
 *     summary: Delete a menu
 *     tags: [Menu]
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
 *             properties:
 *               menuId:
 *                 type: string
 *                 example: "menu_123"
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Bad Request
 */
menuRouter.delete("/", isAuthenticated, isAuthorized(["Owner"]), validateRequest(deleteMenuSchema), menuController.deleteMenu);

/**
 * @swagger
 * /api/v1/menu:
 *   patch:
 *     summary: Enable or disable a menu
 *     tags: [Menu]
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
 *             properties:
 *               menuId:
 *                 type: string
 *                 example: "menu_123"
 *     responses:
 *       200:
 *         description: Menu status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Bad Request
 */
menuRouter.patch("/", isAuthenticated, isAuthorized(["Owner"]), validateRequest(enableOrDisableMenuSchema), menuController.enableOrDisableMenu);

/**
 * @swagger
 * /api/v1/menu/all-menus:
 *   get:
 *     summary: View history list of restaurant menus
 *     tags: [Menu]
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
 *                 example: "rest_123"
 *     responses:
 *       200:
 *         description: List of restaurant menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Menu'
 *       400:
 *         description: Bad Request
 */
menuRouter.get("/all-menus", isAuthenticated, isAuthorized(["Owner"]), validateRequest(viewHistoryListOfRestaurantMenusSchema), menuController.viewHistoryListOfRestaurantMenus);

export { menuRouter }


