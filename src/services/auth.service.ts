import { loginDTO } from "../dto/login.dto";
import { prisma, ExtendedTransactionClient } from "../config/prisma.config";
import { RoleKey } from "../generated/prisma/enums";
import { SignupDTO } from "../dto/signup.dto";
import { PasswordUtils } from "../utils/password.utils";
import { emailService } from "./email.service";
import {
  BadRequestError,
  ConflictError,
  CustomError,
  InternalServerError,
  UnauthorizedError,
} from "../utils/errors";
import { userService } from "./user.service";
import { customerService } from "./customer.service";
import { userTokenService } from "./user-token.service";
import { jwtUtils } from "../utils/jwt/jwt.utils";
import { USER_DEFAULT_SELECT } from "../utils/constants";
import { UserDTO } from "../dto/user.dto";
import { StatusCodes } from "http-status-codes";
import { userRepository } from "../repositories/user.repository";
import { UserSession, UserWithRelations } from "../types/user.type";

class AuthService {
  async signup(signupDto: SignupDTO): Promise<void> {
    const { name, password, email, phone } = signupDto;

    const userCheck = await userService.findUserByEmail(email);
    if (userCheck) throw ConflictError("Email already exists");

    const hashedPassword = await PasswordUtils.hash(password);

    await prisma.$transaction(async (tx: ExtendedTransactionClient) => {
      const newUser = await userService.createUser(
        {
          userName: name,
          userEmail: email,
          userPassword: hashedPassword,
          // Email verification disabled: accounts are active immediately.
          isConfirmed: true,
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
      await userService.assignRoleToUser(newUser.userId, "CUSTOMER", tx);
    });
  }

  async login(loginDto: loginDTO): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDTO;
  }> {
    const { email, password } = loginDto;

    if (!email || !password) throw BadRequestError("Email and password are required!");

    const user = await userService.findUserByEmail<UserWithRelations>(email, {
      ...USER_DEFAULT_SELECT,
      userPassword: true,
    });

    if (!user) throw UnauthorizedError("Invalid credentials!");

    if (!user.isActive) throw UnauthorizedError("You do not have access to login to the system!");

    if (!user.isConfirmed) throw UnauthorizedError("You have not confirmed your email!");

    const match = await PasswordUtils.compare(password, user.userPassword);
    if (!match) throw UnauthorizedError("Invalid credentials!");

    let userRoleKeys: RoleKey[] = [];
    if (user.roles && Array.isArray(user.roles)) {
      userRoleKeys = user.roles as RoleKey[];
    }

    const tokenPayload: UserSession = {
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

    return {
      accessToken,
      refreshToken,
      user: new UserDTO(user),
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
    const tokenData = jwtUtils.verifyToken<{ userId: string; userEmail: string }>(token);

    const user = await userService.findUserByEmail(tokenData.userEmail, {
      isConfirmed: true,
      userEmail: true,
      userId: true,
    });
    if (!user) throw BadRequestError("User not found!");

    if (user.isConfirmed) throw BadRequestError("User is already verified!");

    try {
      await userService.findAndUpdateUserByEmail(user.userId, user.userEmail, {
        isConfirmed: true,
      });
    } catch (error) {
      throw InternalServerError("Failed to verify email!");
    }
  }

  async resendVerification(email: string): Promise<string | null> {
    const user = await userService.findUserByEmail(email);

    if (!user) return null;

    if (user.isConfirmed) throw BadRequestError("Email is already verified");

    const verificationLink = this.generateVerificationToken(user.userId, user.userEmail);

    try {
      await emailService.sendVerificationEmail(user.userEmail, verificationLink, user.userName);
    } catch (err) {
      console.error("[resendVerification] Email failed to send:", err);
    }

    return verificationLink;
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

    // Fetch latest user data from DB to ensure valid status and roles
    const user = await userRepository.findUserById<UserWithRelations>(userData.userId, {
      ...USER_DEFAULT_SELECT,
      userPassword: true,
    });

    if (!user) throw UnauthorizedError("User not found!");
    if (!user.isActive) throw UnauthorizedError("User is inactive!");

    // Generate new access token
    const payload: UserSession = {
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userRoles: user.roles || [], // RoleKey[]
    };

    if (user.isAdmin) {
      payload.isAdmin = true;
    }

    if (user.customer) {
      payload.customerId = user.customer.customerId;
    }

    if (user.restaurant) {
      payload.restaurantId = user.restaurant.restaurantId;
    }

    const accessToken = jwtUtils.generateAccessToken(payload);

    return {
      accessToken,
      user: new UserDTO(user),
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (!refreshToken) {
      throw UnauthorizedError();
    }

    await userTokenService.revokeToken(userId, refreshToken);
  }

  async logoutAll(userId: string, refreshToken?: string) {
    if (!refreshToken) throw UnauthorizedError();

    await userTokenService.revokeAllUserTokens(userId);
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

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = jwtUtils.verifyToken(token);
    if (!decoded || typeof decoded === "string" || !decoded.userId)
      throw BadRequestError("Invalid or expired reset token");

    const tokenData = await userTokenService.findValidToken(token, "FORGOT_PASSWORD");

    if (!tokenData) {
      throw BadRequestError("Invalid or expired reset token");
    }

    const hashedPassword = await PasswordUtils.hash(newPassword);

    await userService.updateUserById(tokenData.userId, { userPassword: hashedPassword });

    await userTokenService.revokeToken(tokenData.userId, token);

    // Security: Revoke all refresh tokens (logout from all devices)
    await userTokenService.revokeAllUserTokensByType(tokenData.userId, "REFRESH");
  }

  generateVerificationToken(userId: string, email: string): string {
    const token = jwtUtils.generateToken(
      {
        userId,
        userEmail: email,
      },
      "1d"
    );

    const verificationLink = `${process.env.EMAIL_VERIFICATION_URL}?token=${token}`;

    console.log("verificationLink", verificationLink);

    return verificationLink;
  }
}

export const authService = new AuthService();
