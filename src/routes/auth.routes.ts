import express from "express";
import { validateRequest } from "../middleware/validate-request";
import { signUpSchema } from "../validation/user.signup";
import { logInSchema } from "../validation/user.login";
import { forgetPasswordSchema } from "../validation/forget-password.validation";
import { resetPasswordSchema } from "../validation/reset-password.validation";
import { authController } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth.middleware";
import { confirmEmailSchema, requireEmailSchema } from "../validation/user.confirmEmail";

const authRouter = express.Router();

authRouter.post("/signup", validateRequest(signUpSchema), authController.signup);
authRouter.put("/login", validateRequest(logInSchema), authController.login);
authRouter.post("/refresh-token", authController.refreshToken);

// Verify Email Routes
authRouter.get("/verify-email", validateRequest(confirmEmailSchema), authController.verifyEmail);
authRouter.post(
  "/resend-verification",
  validateRequest(requireEmailSchema),
  authController.resendVerification
);

// Protected routes
authRouter.post("/logout", isAuthenticated, authController.logout);
authRouter.post("/logout-all", isAuthenticated, authController.logoutAll);
authRouter.get("/sessions", isAuthenticated, authController.getActiveSessions);

// Password Reset Routes
authRouter.post(
  "/forgot-password",
  validateRequest(forgetPasswordSchema),
  authController.forgetPassword
);
authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

export { authRouter };
