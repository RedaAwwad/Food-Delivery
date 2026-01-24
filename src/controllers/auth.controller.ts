import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { authService } from "../services/auth.service";
import { jwtUtils } from "../utils/jwt/jwt.utils";
import { CookieUtils } from "../utils/cookie/cookie.utils";
import { REFRESH_TOKEN_COOKIE_NAME } from "../utils/constants";

class AuthController {
  async signup(req: Request, res: Response) {
    const signupDto = req.body;

    await authService.signup(signupDto);
    return res.status(StatusCodes.CREATED).json(
      new SuccessResponse({
        message: "Signup successful. Please verify your email.",
      })
    );
  }

  async login(req: Request, res: Response) {
    const loginDto = req.body;

    const { accessToken, refreshToken, user } = await authService.login(loginDto);

    CookieUtils.setCookie(res, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      maxAge: 60 * 60 * 24 * 90,
      httpOnly: true,
    });

    return res.json(
      new SuccessResponse({
        data: {
          accessToken,
          user,
        },
      })
    );
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
        message: "If you have this email registered, a new verification email will be sent.",
      })
    );
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = jwtUtils.getRefreshTokenFromCookies(req);

    const { accessToken, user } = await authService.refreshToken(refreshToken);
    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        message: "Access token refreshed successfully.",
        data: { accessToken, user },
      })
    );
  }

  async logout(req: Request, res: Response) {
    const refreshToken = CookieUtils.getCookie(req, REFRESH_TOKEN_COOKIE_NAME);

    await authService.logout(req.user!.userId, refreshToken);

    CookieUtils.deleteCookie(res, REFRESH_TOKEN_COOKIE_NAME);

    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Logged out successfully" }));
  }

  async logoutAll(req: Request, res: Response) {
    const refreshToken = CookieUtils.getCookie(req, REFRESH_TOKEN_COOKIE_NAME);

    await authService.logoutAll(req.user!.userId, refreshToken);

    CookieUtils.deleteCookie(res, REFRESH_TOKEN_COOKIE_NAME);

    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Logged out from all sessions successfully." }));
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
