import { loginDTO } from "../dto/login.dto";
import { SignupDTO } from "../dto/signup.dto";
import { Request, Response } from "express";
import { AuthResponse } from "../types/token";
import {
  generateAccessToken,
  generateJwtTokenForGeneralUse,
  generateRefreshToken,
  generateTokenPair,
  verifyJwtTokenForGeneralUse,
  verifyRefreshToken,
} from "../utils/generateAndVerifyToken";
import { cookieService } from "./cookie.service";
import { compare, hash } from "../utils/HashAndCompare";
import { emailService } from "./email.service";
import { TokenType, User } from "../generated/prisma";
import { v7 as uuidv7 } from "uuid";
import { roleService } from "./role.service";
import { BadRequestError, ConflictError, CustomError, UnauthorizedError } from "../utils/errors";
import { userService } from "./user.service";
import { customerService } from "./customer.service";
import { userTokenService } from "./user-token.service";
import { jwtUtils } from "../utils/jwt/jwt.utils";
import { USER_DEFAULT_SELECT } from "../utils/constants";
import { TokenPayload } from "../types/token";
import { UserWithRelations } from "../types/user.type";
import { UserDTO } from "../dto/user.dto";
import { StatusCodes } from "http-status-codes";
import { userRepository } from "../repositories/user.repository";

class AuthService {
  private readonly REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

  async signup(signupDto: SignupDTO) {
    const { userName, userPassword, userEmail, userPhoneNumber } = signupDto;

    const userCheck = await userService.findUserByEmail(userEmail);
    if (userCheck) throw ConflictError("Email already exists");

    const hashedPassword = await hash(userPassword);

    // Transactional feeling, but manual for now
    const newUser = await userService.createUser({
      userId: uuidv7(),
      userName,
      userEmail,
      userPassword: hashedPassword,
      isActive: true,
    });

    if (!newUser) throw BadRequestError("Failed to Create User");

    const newCustomer = await customerService.createCustomer({
      customerId: uuidv7(),
      userId: newUser.userId,
      customerPhone: String(userPhoneNumber || ""),
      customerAvatar: "",
      createdById: newUser.userId,
      updatedById: newUser.userId,
    });

    if (!newCustomer) throw BadRequestError("Failed to Create Customer");

    // Assign default 'Customer' role
    const isRoleAssigned = await roleService.assignRoleToUser(newUser.userId, "Customer");
    if (!isRoleAssigned) throw BadRequestError("Failed to assign default Customer role");

    // Generate verification token
    const expiryTime = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "86400000", 10); // Default 24 hours

    const token = jwtUtils.generateToken(
      {
        userId: newUser.userId,
        userEmail: newUser.userEmail,
      },
      "1d"
    );

    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

    // Send verification email
    await emailService.sendVerificationEmail(newUser.userEmail, verificationLink, newUser.userName);

    const returnedUser = {
      userId: newUser.userId,
      userName: newUser.userName,
      userEmail: newUser.userEmail,
    };
    const returnedCustomer = {
      customerId: newCustomer.customerId,
      customerPhone: newCustomer.customerPhone,
      customerAvatar: newCustomer.customerAvatar,
    };

    return {
      user: returnedUser,
      customer: returnedCustomer,
      message: "Signup successful. Please verify your email.",
    };
  }

  async login(loginDto: loginDTO): Promise<AuthResponse> {
    const { email, password } = loginDto;

    if (!email || !password) throw BadRequestError("Email and password are required!");

    const user = await userService.findUserByEmail(email, {
      ...USER_DEFAULT_SELECT,
      userPassword: true,
    });

    if (!user) throw UnauthorizedError("Invalid credentials!");

    const match = await compare(password, user.userPassword);
    if (!match) throw UnauthorizedError("Invalid credentials!");

    let userRoleKeys: string[] = [];
    if (user?.userRoles) {
      userRoleKeys = user.userRoles.map((role) => role.role.roleKey);
    }

    const tokenPayload: TokenPayload = {
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userRoles: userRoleKeys,
    };

    if (user.isAdmin) {
      tokenPayload.isAdmin = true;
    }

    if (user?.customer && user.customer?.customerId) {
      tokenPayload.customerId = user.customer.customerId;
    }

    if (user?.restaurant && user.restaurant?.restaurantId) {
      tokenPayload.restaurantId = user.restaurant.restaurantId;
    }

    const accessToken = jwtUtils.generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Delete old refresh token
    await userTokenService.deleteRefreshTokensByUserId(user.userId);

    // Store new refresh token
    await userTokenService.createToken({
      userId: user.userId,
      token: refreshToken,
      expiresAt: jwtUtils.getExpiryDate("REFRESH"),
      tokenType: TokenType.REFRESH,
    });

    const refreshTokenCookie = cookieService.createRefreshTokenCookie(refreshToken);

    return {
      data: {
        accessToken,
        user: new UserDTO(user),
      },
      cookies: [refreshTokenCookie],
    };
  }

  async me(userId: string): Promise<UserDTO> {
    const user = await userRepository.findUserById(userId, USER_DEFAULT_SELECT);

    if (!user) {
      throw new CustomError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    return new UserDTO(user);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenData = verifyJwtTokenForGeneralUse(token);

    if (!tokenData || typeof tokenData === "string" || !tokenData.userId || !tokenData.userEmail)
      throw BadRequestError("Invalid or expired verification token");

    try {
      await userService.findAndUpdateUserByEmail(tokenData.userEmail, { isConfirmed: true });
    } catch (error) {
      throw BadRequestError("User not found");
    }

    console.log(`✅ Email verified for user ${tokenData.userId}`);
  }

  async resendVerification(email: string): Promise<void> {
    console.log(`📧 Resending verification email to: ${email}`);

    const user = await userService.findUserByEmail(email);

    if (!user) {
      console.log(`⚠️ User not found for email: ${email}, but returning success for security`);
      return;
    }

    // Check if user is already verified
    if (user.isConfirmed) throw BadRequestError("Email is already verified");

    // Create new verification token
    const expiryTime = parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "86400000", 10);
    const expiresAt = new Date(Date.now() + expiryTime);

    const token = generateJwtTokenForGeneralUse({
      userId: user.userId,
      userEmail: user.userEmail,
      tokenType: TokenType.VERIFICATION,
    });

    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

    // Send verification email
    await emailService.sendVerificationEmail(user.userEmail, verificationLink, user.userName);

    console.log(`✅ Verification email resent to: ${email}`);
  }

  async refreshToken(requestRefreshToken?: string): Promise<AuthResponse> {
    const refreshToken = requestRefreshToken;

    if (!refreshToken) throw UnauthorizedError("Refresh token is required");

    const isValid = await userTokenService.isValid(refreshToken, TokenType.REFRESH);

    if (!isValid) throw UnauthorizedError("Invalid or expired refresh token");

    // Generate new access token
    const result = await this.refreshAccessToken(refreshToken);

    // Generate new refresh token (optional: token rotation)
    const newRefreshToken = generateRefreshToken({
      userId: result.user.userId,
      customerId: result.user.customerId,
      userName: result.user.userName,
      userEmail: result.user.userEmail,
    });

    const tokenData = await userTokenService.findTokenByToken(refreshToken);
    if (tokenData) {
      await userTokenService.revokeToken(refreshToken, "token_rotated");
      await userTokenService.createToken({
        userId: tokenData.userId,
        token: newRefreshToken,
        expiresAt: new Date(
          Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRY || "15", 10) * 24 * 60 * 60 * 1000
        ), // 15 days
        tokenType: TokenType.REFRESH,
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
    const decoded = verifyRefreshToken(refreshToken);

    if (typeof decoded === "string" || !decoded.userId)
      throw UnauthorizedError("Invalid Refresh Token");

    const isValid = await userTokenService.isValid(refreshToken, TokenType.REFRESH);
    if (!isValid) throw UnauthorizedError("Invalid or expired refresh token");

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: decoded.userId,
      customerId: decoded.customerId,
      userName: decoded.userName,
      userEmail: decoded.userEmail,
      roles: decoded.roles || [],
      isAdmin: decoded.isAdmin || false,
    });

    const accessTokenExpiresAt = new Date(
      Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRY || "15", 10) * 60 * 1000
    );

    return {
      accessToken,
      accessTokenExpiresAt,
      user: {
        userId: decoded.userId,
        customerId: decoded.customerId,
        userName: decoded.userName,
        userEmail: decoded.userEmail,
      },
    };
  }

  async logout(refreshToken?: string): Promise<AuthResponse> {
    if (refreshToken) {
      await userTokenService.revokeToken(refreshToken, "user_logout");
    }

    // Prepare cookie clearance
    const clearCookies = [this.REFRESH_TOKEN_COOKIE_NAME];

    return {
      data: {},
      clearCookies,
    };
  }

  async logoutAll(refreshToken?: string): Promise<AuthResponse> {
    if (!refreshToken) throw BadRequestError("Refresh token is required");

    const tokenData = await userTokenService.findTokenByToken(refreshToken);

    if (!tokenData) throw UnauthorizedError("Invalid token");

    await userTokenService.revokeAllUserTokens(tokenData.userId);

    // Prepare cookie clearance
    const clearCookies = [this.REFRESH_TOKEN_COOKIE_NAME];

    return {
      data: {},
      clearCookies,
    };
  }

  async getActiveSessions(userId: string): Promise<AuthResponse> {
    const sessions = await userTokenService.findByUserIdAndType(userId, TokenType.REFRESH, true);

    return {
      data: { sessions },
    };
  }

  async cleanupExpiredTokens(): Promise<void> {
    await userTokenService.deleteExpiredTokens();
    await userTokenService.deleteOldRevokedTokens();
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
      const tokenData = await userTokenService.findTokenByToken(refreshToken);
      return tokenData?.userId || null;
    } catch (error) {
      return null;
    }
  }

  // Validate session is still active
  async validateSession(refreshToken: string): Promise<boolean> {
    return userTokenService.isValid(refreshToken, TokenType.REFRESH);
  }

  // Get session count for user
  async getSessionCount(userId: string): Promise<number> {
    return userTokenService.getActiveTokenCount(userId, TokenType.REFRESH);
  }

  // ============ PASSWORD RESET METHODS ============

  async forgetPassword(email: string): Promise<void> {
    console.log(`🔐 Password reset requested for email: ${email}`);

    const user = await userService.findUserByEmail(email);

    // Security: Always return success to prevent email enumeration
    if (!user) {
      console.log(`⚠️ User not found for email: ${email}, but returning success for security`);
      return;
    }

    // Revoke any existing forgot password tokens for this user
    await userTokenService.revokeAllUserTokensByType(
      user.userId,
      TokenType.FORGOT_PASSWORD,
      "new_reset_requested"
    );

    // Generate new forgot password token
    const expiryMs = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || "3600000", 10); // Default 1 hour
    const expiryHours = expiryMs / (1000 * 60 * 60);
    const expiresAt = new Date(Date.now() + expiryMs);

    const token = generateJwtTokenForGeneralUse({
      userId: user.userId,
      userEmail: user.userEmail,
      tokenType: TokenType.FORGOT_PASSWORD,
    });

    await userTokenService.createToken({
      userId: user.userId,
      token: token,
      tokenType: TokenType.FORGOT_PASSWORD,
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

    console.log(`✅ Password reset email sent to: ${email}`);
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const decoded = verifyJwtTokenForGeneralUse(token);
      if (!decoded || typeof decoded === "string" || !decoded.userId) return false;

      return await userTokenService.isValid(token, TokenType.FORGOT_PASSWORD);
    } catch (error) {
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.log(`🔐 Password reset attempt with token`);

    const decoded = verifyJwtTokenForGeneralUse(token);
    if (!decoded || typeof decoded === "string" || !decoded.userId)
      throw BadRequestError("Invalid or expired reset token");

    const tokenData = await userTokenService.findValidToken(token, TokenType.FORGOT_PASSWORD);

    if (!tokenData) {
      console.log(`❌ Invalid or expired reset token`);
      throw BadRequestError("Invalid or expired reset token");
    }

    const hashedPassword = await hash(newPassword);

    await userService.updateUser(tokenData.userId, { userPassword: hashedPassword });

    await userTokenService.revokeToken(token, "password_reset_completed");

    // Security: Revoke all refresh tokens (logout from all devices)
    await userTokenService.revokeAllUserTokensByType(
      tokenData.userId,
      TokenType.REFRESH,
      "password_changed"
    );

    console.log(`✅ Password reset successful for user ${tokenData.userId}`);
  }
}

export const authService = new AuthService();
