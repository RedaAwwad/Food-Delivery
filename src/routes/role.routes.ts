import { Router } from "express";
import { roleController } from "../controllers/role.controller";
import { authenticate, isAuthorized } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/errors/async-handler";

const roleRouter = Router();

// Apply auth to all role routes
roleRouter.use(asyncHandler(authenticate));

// Only Admins can manage roles
roleRouter.post(
    "/",
    isAuthorized(["Admin"]),
    asyncHandler(roleController.createRole)
);

roleRouter.get(
    "/",
    isAuthorized(["Admin"]),
    asyncHandler(roleController.getAllRoles)
);

roleRouter.post(
    "/assign",
    isAuthorized(["Admin"]),
    asyncHandler(roleController.assignRole)
);

roleRouter.delete(
    "/delete-by-id",
    isAuthorized(["Admin"]),
    asyncHandler(roleController.removeRoleById)
);

roleRouter.delete(
    "/delete-by-name",
    isAuthorized(["Admin"]),
    asyncHandler(roleController.removeRoleByName)
);

roleRouter.delete(
    "/demote-user",
    isAuthorized(["Admin"]),
    asyncHandler(roleController.removeRoleFromUser)
);

export default roleRouter;
