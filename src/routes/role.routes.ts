import { Router } from "express";
import { roleController } from "../controllers/role.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

const roleRouter = Router();

// Apply auth to all role routes
roleRouter.use(isAuthenticated);

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
roleRouter.post("/", isAdmin, roleController.createRole);
roleRouter.get("/", isAdmin, roleController.getAllRoles);

/**
 * @swagger
 * /api/v1/roles/assign:
 *   post:
 *     summary: Assign a role to a user
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
 *               - userId
 *               - roleName
 *             properties:
 *               userId:
 *                 type: string
 *               roleName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role assigned successfully
 */
roleRouter.post("/assign", isAdmin, roleController.assignRole);

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
roleRouter.delete("/delete-by-id", isAdmin, roleController.removeRoleById);

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
roleRouter.delete("/delete-by-name", isAdmin, roleController.removeRoleByName);

/**
 * @swagger
 * /api/v1/roles/demote-user:
 *   delete:
 *     summary: Remove a role from a user
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
 *               - userId
 *               - roleName
 *             properties:
 *               userId:
 *                 type: string
 *               roleName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role removed from user successfully
 */
roleRouter.delete("/demote-user", isAdmin, roleController.removeRoleFromUser);

export { roleRouter };
