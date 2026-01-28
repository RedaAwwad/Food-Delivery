import express from "express";
import { userController } from "../controllers/user.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import { findAndUpdateUserSchema, findUserByIdSchema } from "../validation/user.schema";

const userRouter = express.Router();

// Apply auth to all role routes
userRouter.use([isAuthenticated, isAuthorized(["ADMIN"])]);

userRouter.get("/manager/:userId", validateRequest(findUserByIdSchema, "params"), userController.findUserWithRestaurant);
userRouter.put("/find-and-update-by-email", userController.findAndUpdateUserByEmail);
userRouter.get("/find-by-id-with-roles/:userId", validateRequest(findUserByIdSchema, "params"), userController.findUserByIdWithRoles);
userRouter.put("/update", validateRequest(findUserByIdSchema, "params"), validateRequest(findAndUpdateUserSchema, "body"), userController.updateUser);
userRouter.put("/update-is-active", validateRequest(findUserByIdSchema, "body"), userController.updateIsActive);

export { userRouter };
