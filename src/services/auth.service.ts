import { loginDTO } from "../dto/login.dto";
import { SignupDTO } from "../dto/signup.dto";
import { userRepository } from "../repositories/user.repository";
import { customerRepository } from "../repositories/customer.repository";
import { userTokenRepository } from "../repositories/user-token.repository";
import { Request, Response } from "express";
import { AuthResponse } from "../types/token";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
} from "../utils/generateAndVerifyToken";
import { cookieService } from "./cookie.service";
import { compare, hash } from "../utils/HashAndCompare";
import { emailService } from "./email.service";
import { v7 as uuidv7 } from "uuid";
import { roleService } from "./role.service";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors";
import { verifyToken } from "../utils/jwt/verifyToken";
import { checkValidation } from "../utils/checkValidation";

type AccessTokenPayload = {
  userId: string;
  userName: string;
  userEmail: string;
  isAdmin?: boolean;
  customerId?: string;
  restaurantId?: string;
};

class AuthService {
  private readonly REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

  async signup(signupDto: SignupDTO) {
    const { userName, userPassword, userEmail, userPhoneNumber } = signupDto;

    const userCheck = await userRepository.findUserByEmail(userEmail);
    if (userCheck) {
      throw new CustomError({
        message: "Email already exists!",
        statusCode: StatusCodes.CONFLICT,
      });
    }

    const hashedPassword = await hash(userPassword);

    // Transactional feeling, but manual for now
    const newUser = await userRepository.create({
      userId: uuidv7(),
      userName,
      userEmail,
      userPassword: hashedPassword,
    });

    if (!newUser) {
      throw new CustomError({
        message: "Failed to Create User",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const newCustomer = await customerRepository.create({
      customerId: uuidv7(),
      userId: newUser.userId,
      customerPhone: String(userPhoneNumber || ""),
      customerAvatar: "",
      createdById: newUser.userId,
      updatedById: newUser.userId,
    });

    if (!newCustomer) {
      throw new CustomError({
        message: "Failed to Create Customer",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    // Assign default 'Customer' role
    const isRoleAssigned = await roleService.assignRoleToUser(newUser.userId, "Customer");
    if (!isRoleAssigned) {
      throw new CustomError({
        message: "Failed to assign default Customer role",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    // Generate verification token
    const expiryTime = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "86400000", 10); // Default 24 hours
    const expiresAt = new Date(Date.now() + expiryTime);

    const token = generateAccessToken(
      {
        userId: newUser.userId,
        userEmail: newUser.userEmail,
        tokenType: TokenType.VERIFICATION,
      },
      expiryTime / 1000
    );

    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

    // Send verification email
    await emailService.sendVerificationEmail(newUser.userEmail, verificationLink, newUser.userName);

    // const returnedUser = {
    //   userId: newUser.userId,
    //   userName: newUser.userName,
    //   userEmail: newUser.userEmail,
    // };
    // const returnedCustomer = {
    //   customerId: newCustomer.customerId,
    //   customerPhone: newCustomer.customerPhone,
    //   customerAvatar: newCustomer.customerAvatar,
    // };

    // return {
    //   user: returnedUser,
    //   customer: returnedCustomer,
    //   message: "Signup successful. Please verify your email.",
    // };

    return true;
  }

  async login(loginDto: loginDTO): Promise<AuthResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new CustomError({
        message: "Email and password are required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const user = await userRepository.findUserByEmail<{
      userPassword: string;
      customer: { customerId: string };
      restaurant: { restaurantId: string };
    }>(email, {
      userPassword: true,
      customer: { select: { customerId: true } },
      restaurant: { select: { restaurantId: true } },
    });

    if (!user) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const match = await compare(password, user.userPassword);
    if (!match) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // const activeUser = await userRepository.updateIsActive(user.userId, true);
    const tokenPayload: AccessTokenPayload = {
      userId: user.userId as string,
      userName: user.userName as string,
      userEmail: user.userEmail as string,
    };

    if (user.isAdmin) {
      tokenPayload.isAdmin = true;
    }

    if (user.customer) {
      tokenPayload.customerId = user.customer?.customerId;
    }

    if (user.restaurant) {
      tokenPayload.restaurantId = user.restaurant?.restaurantId;
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } = generateTokenPair(tokenPayload);

    // Store refresh token
    await userTokenRepository.createToken({
      userId: user.userId as string,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
      tokenType: "REFRESH",
    });

    const refreshTokenCookie = cookieService.createRefreshTokenCookie(refreshToken);

    return {
      data: {
        accessToken,
        user,
      },
      cookies: [refreshTokenCookie],
    };
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenData = verifyToken(token);

    console.log({ tokenData });

    if (!tokenData || typeof tokenData === "string" || !tokenData.userId || !tokenData.userEmail) {
      throw new CustomError({
        message: "Invalid or expired verification token",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    try {
      await userRepository.findAndUpdateUserByEmail(tokenData.userEmail, { isConfirmed: true });
    } catch (error) {
      throw new CustomError({
        message: "User not found",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }
  }

  async resendVerification(email: string): Promise<void> {
    const user = await userRepository.findUserByEmail(email);

    if (!user) {
      throw new CustomError({
        message: "Email not found!",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    // Check if user is already verified
    if (user.isConfirmed) {
      throw new CustomError({
        message: "Email is already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    // Create new verification token
    const expiryTime = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "86400000", 10);
    const expiresAt = new Date(Date.now() + expiryTime);

    const token = generateAccessToken(
      {
        userId: user.userId,
        userEmail: user.userEmail,
        tokenType: "VERIFICATION",
      },
      expiryTime / 1000
    );

    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

    // Send verification email
    await emailService.sendVerificationEmail(user.userEmail, verificationLink, user.userName);

    console.log(`✅ Verification email resent to: ${email}`);
  }

  async refreshToken(requestRefreshToken?: string): Promise<AuthResponse> {
    const refreshToken = requestRefreshToken;

    if (!refreshToken) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const isValid = await userTokenRepository.isValid(refreshToken, "REFRESH");

    if (!isValid) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // Generate new access token
    const result = await this.refreshAccessToken(refreshToken);

    // Generate new refresh token (optional: token rotation)
    const newRefreshToken = generateRefreshToken({
      userId: result.user.userId,
      userName: result.user.userName,
      userEmail: result.user.userEmail,
    });

    const tokenData = await userTokenRepository.findByToken(refreshToken);
    if (tokenData) {
      await userTokenRepository.revokeToken(refreshToken, "token_rotated");
      await userTokenRepository.createToken({
        userId: tokenData.userId,
        token: newRefreshToken,
        expiresAt: new Date(
          Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRY || "15", 10) * 24 * 60 * 60 * 1000
        ), // 15 days
        tokenType: "REFRESH",
      });
    }

    // Prepare new cookie
    const refreshTokenCookie = cookieService.createRefreshTokenCookie(newRefreshToken);

    const response: AuthResponse = {
      data: result,
    };

    if (refreshTokenCookie) {
      response.cookies = [refreshTokenCookie];
    }

    return response;
  }

  async refreshAccessToken(refreshToken: string) {
    // Verify JWT
    const decoded = verifyToken(refreshToken);
    const isValid = await userTokenRepository.isValid(refreshToken, "REFRESH");

    if (!isValid) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      userName: decoded.userName,
      userEmail: decoded.userEmail,
    });

    const accessTokenExpiresAt = new Date(
      Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRY || "15", 10) * 60 * 1000
    );

    return {
      accessToken,
      accessTokenExpiresAt,
      user: {
        userId: decoded.userId,
        userName: decoded.userName,
        userEmail: decoded.userEmail,
      },
    };
  }

  async logout(refreshToken?: string): Promise<AuthResponse> {
    if (refreshToken) {
      await userTokenRepository.revokeToken(refreshToken, "user_logout");
    }

    // Prepare cookie clearance
    const clearCookies = [this.REFRESH_TOKEN_COOKIE_NAME];

    return {
      data: {},
      clearCookies,
    };
  }

  async logoutAll(refreshToken?: string): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new CustomError({
        message: "Refresh token is required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const tokenData = await userTokenRepository.findByToken(refreshToken);

    if (!tokenData) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    await userTokenRepository.revokeAllUserTokens(tokenData.userId);

    // Prepare cookie clearance
    const clearCookies = [this.REFRESH_TOKEN_COOKIE_NAME];

    return {
      data: {},
      clearCookies,
    };
  }

  async getActiveSessions(userId: string): Promise<AuthResponse> {
    const sessions = await userTokenRepository.findByUserIdAndType(userId, "REFRESH", true);

    return {
      data: { sessions },
    };
  }

  async cleanupExpiredTokens(): Promise<void> {
    await userTokenRepository.deleteExpiredTokens();
    await userTokenRepository.deleteOldRevokedTokens();
  }

  extractRefreshToken(req: Request) {
    // 1. Check cookies first (primary method)
    const cookieToken = cookieService.getCookieValue(req, this.REFRESH_TOKEN_COOKIE_NAME);
    if (cookieToken) return cookieToken;

    // 2. Check authorization header (fallback)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Refresh ")) {
      return authHeader.split(" ")[1];
    }

    // 3. Check body (fallback)
    const bodyToken = req.body.refreshToken;
    if (bodyToken) return bodyToken;

    return null;
  }

  // Helper to apply cookies to response
  applyCookies(res: Response, authResponse: AuthResponse): void {
    // Set new cookies
    if (authResponse.cookies) {
      cookieService.setCookies(res, authResponse.cookies);
    }

    // Clear cookies
    if (authResponse.clearCookies) {
      cookieService.clearCookies(res, authResponse.clearCookies);
    }
  }

  // Helper to clear all auth cookies
  clearAllAuthCookies(res: Response): void {
    const authCookies = [this.REFRESH_TOKEN_COOKIE_NAME];
    cookieService.clearCookies(res, authCookies, {
      path: "/", // Clear from all paths
    });
  }

  // Get user ID from refresh token
  async getUserIdFromRefreshToken(refreshToken: string): Promise<string | null> {
    try {
      const tokenData = await userTokenRepository.findByToken(refreshToken);
      return tokenData?.userId || null;
    } catch (error) {
      return null;
    }
  }

  // Validate session is still active
  async validateSession(refreshToken: string): Promise<boolean> {
    return userTokenRepository.isValid(refreshToken, "REFRESH");
  }

  // Get session count for user
  async getSessionCount(userId: string): Promise<number> {
    return userTokenRepository.getActiveTokenCount(userId, "REFRESH");
  }

  // ============ PASSWORD RESET METHODS ============

  async forgetPassword(email: string): Promise<void> {
    const user = await userRepository.findUserByEmail(email);

    // Security: Always return success to prevent email enumeration
    if (!user || !user?.userId) {
      throw new CustomError({
        message: "Internal server error!",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }

    // Revoke any existing forgot password tokens for this user
    await userTokenRepository.revokeAllUserTokensByType(
      user.userId,
      "FORGOT_PASSWORD",
      "new_reset_requested"
    );

    // Generate new forgot password token
    const expiryMs = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || "3600000", 10); // Default 1 hour
    const expiryHours = expiryMs / (1000 * 60 * 60);
    const expiresAt = new Date(Date.now() + expiryMs);

    const token = generateAccessToken(
      {
        userId: user.userId,
        userEmail: user.userEmail,
        tokenType: "FORGOT_PASSWORD",
      },
      expiryMs / 1000
    );

    await userTokenRepository.createToken({
      userId: user.userId,
      token: token,
      tokenType: "FORGOT_PASSWORD",
      expiresAt,
    });

    // Construct reset link
    const resetLink = `${process.env.PASSWORD_RESET_URL}?token=${token}`;

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.userEmail, {
      userName: user.userName,
      resetLink,
      expiryHours,
    });
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const decoded = verifyToken(token);
      if (!decoded || typeof decoded === "string" || !decoded.userId) return false;

      return await userTokenRepository.isValid(token, "FORGOT_PASSWORD");
    } catch (error) {
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      throw new CustomError({
        message: "Invalid or expired reset token",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const tokenData = await userTokenRepository.findValidToken(token, "FORGOT_PASSWORD");

    if (!tokenData) {
      throw new CustomError({
        message: "Invalid or expired reset token",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const hashedPassword = await hash(newPassword);

    await userRepository.update(tokenData.userId, { userPassword: hashedPassword });

    await userTokenRepository.revokeToken(token, "password_reset_completed");

    // Security: Revoke all refresh tokens (logout from all devices)
    await userTokenRepository.revokeAllUserTokensByType(
      tokenData.userId,
      "REFRESH",
      "password_changed"
    );
  }
}

export const authService = new AuthService();
