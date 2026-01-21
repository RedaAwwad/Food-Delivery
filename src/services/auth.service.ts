import { loginDTO } from "../dto/login.dto";
import { prisma } from "../config/prisma.config";
import { Prisma } from "../generated/prisma";
import { SignupDTO } from "../dto/signup.dto";
import { AuthResponse } from "../types/token";
import { cookieService } from "./cookie.service";
import { PasswordUtils } from "../utils/password.utils";
import { emailService } from "./email.service";
import { roleService } from "./role.service";
import { BadRequestError, ConflictError, CustomError, UnauthorizedError } from "../utils/errors";
import { userService } from "./user.service";
import { customerService } from "./customer.service";
import { userTokenService } from "./user-token.service";
import { jwtUtils } from "../utils/jwt/jwt.utils";
import { USER_DEFAULT_SELECT } from "../utils/constants";
import { TokenPayload } from "../types/token";
import { UserDTO } from "../dto/user.dto";
import { StatusCodes } from "http-status-codes";
import { userRepository } from "../repositories/user.repository";
import { UserSession, UserWithRelations } from "../types/user.type";

class AuthService {
  private readonly REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

  async signup(signupDto: SignupDTO) {
    const { name, password, email, phone } = signupDto;

    const userCheck = await userService.findUserByEmail(email);
    if (userCheck) throw ConflictError("Email already exists");

    const hashedPassword = await PasswordUtils.hash(password);

    await prisma
      .$transaction(async (tx: Prisma.TransactionClient) => {
        const newUser = await userService.createUser(
          {
            userName: name,
            userEmail: email,
            userPassword: hashedPassword,
          },
          tx
        );

        if (!newUser) throw BadRequestError("Failed to Create User");

        const newCustomer = await customerService.createCustomer(
          {
            userId: newUser.userId,
            customerPhone: phone,
            createdById: newUser.userId,
            updatedById: newUser.userId,
          },
          tx
        );

        if (!newCustomer) throw BadRequestError("Failed to Create Customer");

        // Assign default 'Customer' role
        const isRoleAssigned = await roleService.assignRoleToUser(newUser.userId, "CUSTOMER", tx);
        if (!isRoleAssigned) throw BadRequestError("Failed to assign default Customer role");

        const token = jwtUtils.generateToken(
          {
            userId: newUser.userId,
            userEmail: newUser.userEmail,
          },
          "1d"
        );

        const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

        return { newUser, verificationLink };
      })
      .then(async ({ newUser, verificationLink }) => {
        await emailService.sendVerificationEmail(
          newUser.userEmail,
          verificationLink,
          newUser.userName
        );
      });

    return {
      message: "Signup successful. Please verify your email.",
    };
  }

  async login(loginDto: loginDTO): Promise<AuthResponse> {
    const { email, password } = loginDto;

    if (!email || !password) throw BadRequestError("Email and password are required!");

    const user = await userRepository.findUserByEmail<UserWithRelations>(email, {
      ...USER_DEFAULT_SELECT,
      userPassword: true,
    });

    if (!user) throw UnauthorizedError("Invalid credentials!");

    if (!user.isActive) throw UnauthorizedError("You do not have access to login to the system!");

    if (!user.isConfirmed) throw UnauthorizedError("You have not confirmed your email!");

    const match = await PasswordUtils.compare(password, user.userPassword);
    if (!match) throw UnauthorizedError("Invalid credentials!");

    let userRoleKeys: string[] = [];
    if (user?.userRoles) {
      userRoleKeys = user.userRoles.map((role: any) => role.role.roleKey);
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

    if (user?.customer) {
      tokenPayload.customerId = user.customer.customerId;
    }

    if (user?.restaurant) {
      tokenPayload.restaurantId = user.restaurant.restaurantId;
    }

    const accessToken = jwtUtils.generateAccessToken(tokenPayload);
    const refreshToken = jwtUtils.generateRefreshToken(tokenPayload);

    // Delete old refresh token
    await userTokenService.deleteRefreshTokensByUserId(user.userId);

    // Store new refresh token
    await userTokenService.createToken({
      userId: user.userId,
      token: refreshToken,
      expiresAt: jwtUtils.getExpiryDate("REFRESH"),
      tokenType: "REFRESH",
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
    const user = await userRepository.findUserById<UserWithRelations>(userId, USER_DEFAULT_SELECT);

    if (!user) {
      throw new CustomError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    return new UserDTO(user);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenData = jwtUtils.verifyToken(token);

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

    const token = jwtUtils.generateToken(
      {
        userId: user.userId,
        userEmail: user.userEmail,
      },
      "1h"
    );

    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

    // Send verification email
    await emailService.sendVerificationEmail(user.userEmail, verificationLink, user.userName);

    console.log(`✅ Verification email resent to: ${email}`);
  }

  async refreshToken(token: string | null): Promise<{
    accessToken: string;
    user: UserDTO;
  }> {
    if (!token) {
      throw UnauthorizedError("Invalid refresh token!");
    }

    // validate refresh token
    const userData = jwtUtils.verifyRefreshToken(token);

    // Generate new access token
    const payload: UserSession = {
      userId: userData.userId,
      userName: userData.userName,
      userEmail: userData.userEmail,
      userRoles: userData.userRoles,
    };

    if (userData.isAdmin) {
      payload.isAdmin = userData.isAdmin;
    }

    if (userData.customerId) {
      payload.customerId = userData.customerId;
    }

    if (userData.restaurantId) {
      payload.restaurantId = userData.restaurantId;
    }

    const accessToken = jwtUtils.generateAccessToken(payload);

    return {
      accessToken,
      user: new UserDTO(userData as UserWithRelations),
    };
  }

  // async refreshAccessToken(refreshToken: string) {

  // }

  async logout(refreshToken?: string): Promise<AuthResponse> {
    if (refreshToken) {
      await userTokenService.revokeToken(refreshToken);
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

  async cleanupExpiredTokens(): Promise<void> {
    await userTokenService.deleteExpiredTokens();
    await userTokenService.deleteOldRevokedTokens();
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
    return userTokenService.isValid(refreshToken, "REFRESH");
  }

  // Get session count for user
  async getSessionCount(userId: string): Promise<number> {
    return userTokenService.getActiveTokenCount(userId, "REFRESH");
  }

  // ============ PASSWORD RESET METHODS ============

  async forgetPassword(email: string): Promise<void> {
    const user = await userService.findUserByEmail(email);

    // Security: Always return success to prevent email enumeration
    if (!user) {
      throw new CustomError({
        message: "User not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    // Revoke any existing forgot password tokens for this user
    await userTokenService.revokeAllUserTokensByType(user.userId, "FORGOT_PASSWORD");

    const token = jwtUtils.generateToken(
      {
        userId: user.userId,
        userEmail: user.userEmail,
      },
      "1h"
    );

    await userTokenService.createToken({
      userId: user.userId,
      token: token,
      tokenType: "FORGOT_PASSWORD",
      expiresAt: jwtUtils.getExpiryDate("FORGOT_PASSWORD"),
    });

    // Construct reset link
    const resetLink = `${process.env.PASSWORD_RESET_URL}?token=${token}`;

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.userEmail, {
      userName: user.userName,
      resetLink,
      expiryHours: jwtUtils.getExpiryDate("FORGOT_PASSWORD").getTime() / (1000 * 60 * 60),
    });
  }

  async validateResetToken(token: string): Promise<boolean> {
    try {
      const decoded = jwtUtils.verifyToken(token);
      if (!decoded || typeof decoded === "string" || !decoded.userId) return false;

      return await userTokenService.isValid(token, "FORGOT_PASSWORD");
    } catch (error) {
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded || typeof decoded === "string" || !decoded.userId)
      throw BadRequestError("Invalid or expired reset token");

    const tokenData = await userTokenService.findValidToken(token, "FORGOT_PASSWORD");

    if (!tokenData) {
      throw BadRequestError("Invalid or expired reset token");
    }

    const hashedPassword = await PasswordUtils.hash(newPassword);

    await userService.updateUser(tokenData.userId, { userPassword: hashedPassword });

    await userTokenService.revokeToken(token);

    // Security: Revoke all refresh tokens (logout from all devices)
    await userTokenService.revokeAllUserTokensByType(tokenData.userId, "REFRESH");
  }
}

export const authService = new AuthService();
