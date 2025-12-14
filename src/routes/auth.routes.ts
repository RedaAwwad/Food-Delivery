import express from "express";
import { validateRequest } from "../middleware/validate-request";
import { signUpSchema } from "../validation/user.signup";
import { asyncHandler } from "../utils/errors/async-handler";
import { logInSchema } from "../validation/user.login";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const authRouter = express.Router();

authRouter.post("/signup", validateRequest(signUpSchema), asyncHandler(authController.signup));
authRouter.put("/login", validateRequest(logInSchema), asyncHandler(authController.login));
authRouter.post("/refresh-token", asyncHandler(authController.refreshToken));

// Protected routes
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));
authRouter.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));
authRouter.get("/sessions", authenticate, asyncHandler(authController.getActiveSessions));

export default authRouter;