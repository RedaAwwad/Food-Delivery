import express from "express";
import { userController } from "../controllers/user.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import { assignRoleSchema, findAndUpdateUserSchema, findUserByIdSchema, removeRoleSchema } from "../validation/user.schema";

const userRouter = express.Router();

// Apply auth to all role routes
userRouter.use(isAuthenticated);
userRouter.use(isAuthorized(["ADMIN"]));

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/v1/users/manager/{userId}:
 *   get:
 *     summary: Find a user with their restaurant
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found with restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
userRouter.get("/manager/:userId", validateRequest(findUserByIdSchema, "params"), userController.findUserWithRestaurant);

/**
 * @swagger
 * /api/v1/users/find-and-update-by-email:
 *   put:
 *     summary: Find and update a user by email
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.put("/find-and-update-by-email", userController.findAndUpdateUserByEmail);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
userRouter.get("/:userId", validateRequest(findUserByIdSchema, "params"), userController.findUserById);

/**
 * @swagger
 * /api/v1/users/update:
 *   put:
 *     summary: Update user details
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               userEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.put("/update", validateRequest(findAndUpdateUserSchema, "body"), userController.updateUserById);

/**
 * @swagger
 * /api/v1/users/update-is-active:
 *   put:
 *     summary: Toggle user active status
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User active status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
userRouter.put("/update-is-active", validateRequest(findUserByIdSchema, "body"), userController.updateIsActive);

/**
 * @swagger
 * /api/v1/users/roles/assign:
 *   post:
 *     summary: Assign a role to a user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleName
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               roleName:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER, RESTAURANT_MANAGER]
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       404:
 *         description: User or Role not found
 */
userRouter.post("/roles/assign", validateRequest(assignRoleSchema, "body"), userController.assignRoleToUser);

/**
 * @swagger
 * /api/v1/users/roles/remove:
 *   delete:
 *     summary: Remove a role from a user
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleName
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               roleName:
 *                 type: string
 *                 enum: [ADMIN, CUSTOMER, RESTAURANT_MANAGER]
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       404:
 *         description: User or Role not found
 */
userRouter.delete("/roles/remove", validateRequest(removeRoleSchema, "body"), userController.removeRoleFromUser);

export { userRouter };
