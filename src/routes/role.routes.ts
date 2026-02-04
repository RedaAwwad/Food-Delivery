import { Router } from "express";
import { roleController } from "../controllers/role.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";

const roleRouter = Router();

// Apply auth to all role routes
roleRouter.use(isAuthenticated);
roleRouter.use(isAuthorized(["ADMIN"]));

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role management endpoints
 */

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   roleName:
 *                     type: string
 *                   roleDesc:
 *                     type: string
 *                   roleKey:
 *                     type: string
 * 
 *   post:
 *     summary: Create a new role
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *               - roleDesc
 *               - roleKey
 *             properties:
 *               roleName:
 *                 type: string
 *               roleDesc:
 *                 type: string
 *               roleKey:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 */
roleRouter.get("/", roleController.getAllRoles);
roleRouter.post("/", roleController.createRole);

/**
 * @swagger
 * /api/v1/roles/delete-by-id:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
roleRouter.delete("/delete-by-id", roleController.removeRoleById);

/**
 * @swagger
 * /api/v1/roles/delete-by-name:
 *   delete:
 *     summary: Delete a role by name
 *     tags: [Role]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *             properties:
 *               roleName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
roleRouter.delete("/delete-by-name", roleController.removeRoleByName);

export { roleRouter };
