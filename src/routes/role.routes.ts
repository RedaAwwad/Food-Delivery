import { Router } from "express";
import { roleController } from "../controllers/role.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { isAdmin } from "../middleware/admin.middleware";

const roleRouter = Router();

// Apply auth to all role routes
roleRouter.use(isAuthenticated);

// Only Admins can manage roles
roleRouter.post("/", isAdmin, roleController.createRole);

roleRouter.get("/", isAdmin, roleController.getAllRoles);

roleRouter.post("/assign", isAdmin, roleController.assignRole);

roleRouter.delete("/delete-by-id", isAdmin, roleController.removeRoleById);

roleRouter.delete("/delete-by-name", isAdmin, roleController.removeRoleByName);

roleRouter.delete("/demote-user", isAdmin, roleController.removeRoleFromUser);

export { roleRouter };
