import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { authService } from "../services/auth.service";
import { CustomError } from "../utils/errors/custom-error";
import { TokenPayload } from "../types/token";
import { jwtUtils } from "../utils/jwt/jwt.utils";
import { UnauthorizedError } from "../utils/errors";

class AuthController {
  async signup(req: Request, res: Response) {
    const signupDto = req.body;

    const data = await authService.signup(signupDto);
    return res.status(StatusCodes.CREATED).json(new SuccessResponse({ data }));
  }

  async login(req: Request, res: Response) {
    const loginDto = req.body;

    const result = await authService.login(loginDto);
    authService.applyCookies(res, result);

    return res.json(new SuccessResponse({ data: result.data }));
  }

  async me(req: Request, res: Response) {
    const userId = req.user!.userId;

    const user = await authService.me(userId);
    return res.status(StatusCodes.OK).json(new SuccessResponse({ data: user }));
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query;
    await authService.verifyEmail(token as string);

    return res.json(
      new SuccessResponse({
        message: "Email verified successfully! You can now login to your account.",
      })
    );
  }

  async resendVerification(req: Request, res: Response) {
    const { email } = req.body;

    await authService.resendVerification(email);

    return res.json(
      new SuccessResponse({
        message:
          "If an account with that email exists and is not verified, a new verification email has been sent.",
      })
    );
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = jwtUtils.getRefreshTokenFromCookies(req);

    const result = await authService.refreshToken(refreshToken);
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
