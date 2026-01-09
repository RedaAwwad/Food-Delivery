import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { authService } from "../services/auth.service";
import { CustomError } from "../utils/errors/custom-error";

class AuthController {
  async signup(req: Request, res: Response) {
    const signupDto = req.body;

    const result = await authService.signup(signupDto);

    return res.status(StatusCodes.CREATED).json(
      new SuccessResponse({
        message: "Your account created successfully. Please verify your email.",
      })
    );
  }

  async login(req: Request, res: Response) {
    const loginDto = req.body;

    const result = await authService.login(loginDto);

    authService.applyCookies(res, result);

    return res.status(StatusCodes.OK).json(new SuccessResponse({ data: result.data }));
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.body;

    await authService.verifyEmail(token as string);

    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        message: "Email verified successfully! You can now login to your account.",
      })
    );
  }

  async resendVerification(req: Request, res: Response) {
    const { email } = req.body;

    await authService.resendVerification(email);

    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        message:
          "If an account with that email exists and is not verified, a new verification email has been sent.",
      })
    );
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = authService.extractRefreshToken(req);

    const result = await authService.refreshToken(refreshToken);

    authService.applyCookies(res, result);

    return res.status(StatusCodes.OK).json(new SuccessResponse({ data: result.data }));
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.refreshToken;

    const result = await authService.logout(refreshToken);

    authService.applyCookies(res, result);

    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Logged out successfully" }));
  }

  async logoutAll(req: Request, res: Response) {
    const refreshToken = req.refreshToken;

    const result = await authService.logoutAll(refreshToken);

    authService.applyCookies(res, result);

    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Logged out from all devices" }));
  }

  async getActiveSessions(req: Request, res: Response) {
    if (!req.user) {
      throw new CustomError({
        message: "User context not found",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
    const userId = req.user.userId;

    const result = await authService.getActiveSessions(userId);

    return res.status(StatusCodes.OK).json(new SuccessResponse({ data: result.data }));
  }

  async forgetPassword(req: Request, res: Response) {
    const { email } = req.body;

    await authService.forgetPassword(email);

    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        message: "If an account with that email exists, a password reset link has been sent.",
      })
    );
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        message: "Password has been reset successfully. Please login with your new password.",
      })
    );
  }
}

export const authController = new AuthController();
