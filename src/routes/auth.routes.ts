import express from "express";
import { validateRequest } from "../middleware/validate-request";
import { signUpSchema } from "../validation/user.signup";
import { asyncHandler } from "../utils/errors/async-handler";
import { logInSchema } from "../validation/user.login";
import { forgetPasswordSchema } from "../validation/forget-password.validation";
import { resetPasswordSchema } from "../validation/reset-password.validation";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { confirmEmailSchema, requireEmailSchema } from "../validation/user.confirmEmail";

const authRouter = express.Router();

authRouter.post("/signup", validateRequest(signUpSchema), asyncHandler(authController.signup));
authRouter.put("/login", validateRequest(logInSchema), asyncHandler(authController.login));
authRouter.post("/refresh-token", asyncHandler(authController.refreshToken));

// Verify Email Routes
authRouter.get(
  "/verify-email",
  validateRequest(confirmEmailSchema),
  asyncHandler(authController.verifyEmail)
);
authRouter.post(
  "/resend-verification",
  validateRequest(requireEmailSchema),
  asyncHandler(authController.resendVerification)
);

// Protected routes
authRouter.post("/logout", authenticate, asyncHandler(authController.logout));
authRouter.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));
authRouter.get("/sessions", authenticate, asyncHandler(authController.getActiveSessions));

// Password Reset Routes
authRouter.post(
  "/forgot-password",
  validateRequest(forgetPasswordSchema),
  asyncHandler(authController.forgetPassword)
);
authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  asyncHandler(authController.resetPassword)
);

export { authRouter };
