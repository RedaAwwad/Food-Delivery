import { loginDTO } from "../dto/login.dto";
import { SignupDTO } from "../dto/signup.dto";
import { userRepository } from "../repositories/user.repository";
import { customerRepository } from "../repositories/customer.repository";
import { userTokenRepository } from "../repositories/user-token.repository";
import { Request, Response } from "express";
import { AuthResponse } from "../types/token";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { generateAccessToken, generateRefreshToken, generateTokenPair, verifyRefreshToken } from "../utils/generateAndVerifyToken";
import { cookieService } from "./cookie.service";
import { compare, hash } from "../utils/HashAndCompare";
import { emailService } from "./email.service";
import { TokenType } from "../generated/prisma";
import { v7 as uuidv7 } from 'uuid';

class AuthService {
    private readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

    async signup(signupDto: SignupDTO) {
        const { userName, userPassword, userEmail, userPhoneNumber } = signupDto;

        const userCheck = await userRepository.findByEmail(userEmail);
        if (userCheck) {
            throw (new CustomError({ message: "Email already exists", statusCode: StatusCodes.CONFLICT }));
        }

        const hashedPassword = await hash(userPassword);
        const userId = uuidv7();

        const newUser = await userRepository.create({
            userId,
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

        const returnedUser = { userId: newUser.userId, userName: newUser.userName, userEmail: newUser.userEmail };
        const returnedCustomer = { customerId: newCustomer.customerId, customerPhone: newCustomer.customerPhone, customerAvatar: newCustomer.customerAvatar };

        return { user: returnedUser, customer: returnedCustomer };
    }

    async login(loginDto: loginDTO): Promise<AuthResponse> {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new CustomError({
                message: "Email and password are required",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new CustomError({
                message: "Invalid email or password",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const match = await compare(password, user.userPassword);
        if (!match) {
            throw new CustomError({
                message: "Invalid email or password",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const activeUser = await userRepository.updateIsActive(user.userId, true);

        const tokenPair = generateTokenPair({
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
        });

        // Store refresh token
        await userTokenRepository.createToken({
            userId: user.userId,
            token: tokenPair.refreshToken,
            expiresAt: tokenPair.refreshTokenExpiresAt,
            tokenType: TokenType.REFRESH
        });

        const refreshTokenCookie = cookieService.createRefreshTokenCookie(tokenPair.refreshToken)

        // Optional: Revoke old tokens if you want single session
        // await refreshTokenRepository.revokeAllExceptCurrent(
        //     user.userId, 
        //     tokenPair.refreshToken,
        //     'new_login'
        // );

        return {
            data: {
                accessToken: tokenPair.accessToken,
                accessTokenExpiresAt: tokenPair.accessTokenExpiresAt,
                user: activeUser
            },
            cookies: [refreshTokenCookie],
        };
    }

    async refreshToken(requestRefreshToken?: string): Promise<AuthResponse> {
        const refreshToken = requestRefreshToken;

        if (!refreshToken) {
            throw new CustomError({
                message: "Refresh token is required",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const isValid = await userTokenRepository.isValid(refreshToken, TokenType.REFRESH);

        if (!isValid) {
            throw new CustomError({
                message: "Invalid or expired refresh token",
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
            await userTokenRepository.revokeToken(refreshToken, 'token_rotated');
            await userTokenRepository.createToken({
                userId: tokenData.userId,
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRY || '15', 10) * 24 * 60 * 60 * 1000), // 15 days
                tokenType: TokenType.REFRESH
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

        if (typeof decoded === 'string' || !decoded.userId) {
            throw new CustomError({
                message: "Invalid refresh token",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const isValid = await userTokenRepository.isValid(refreshToken, TokenType.REFRESH);

        if (!isValid) {
            throw new CustomError({
                message: "Refresh token is invalid or expired",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: decoded.userId,
            userName: decoded.userName,
            userEmail: decoded.userEmail,
        });

        const accessTokenExpiresAt = new Date(Date.now() + (parseInt(process.env.ACCESS_TOKEN_EXPIRY || '15', 10) * 60 * 1000));

        return {
            accessToken,
            accessTokenExpiresAt,
            user: {
                userId: decoded.userId,
                userName: decoded.userName,
                userEmail: decoded.userEmail,
            }
        };
    }

    async logout(refreshToken?: string): Promise<AuthResponse> {
        if (refreshToken) {
            await userTokenRepository.revokeToken(refreshToken, 'user_logout');
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
                message: "No active session",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        const tokenData = await userTokenRepository.findByToken(refreshToken);

        if (!tokenData) {
            throw new CustomError({
                message: "Invalid token",
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
        const sessions = await userTokenRepository.findByUserIdAndType(userId, TokenType.REFRESH, true);

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
        if (authHeader?.startsWith('Refresh ')) {
            return authHeader.split(' ')[1];
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
            path: '/' // Clear from all paths
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
        return userTokenRepository.isValid(refreshToken, TokenType.REFRESH);
    }

    // Get session count for user
    async getSessionCount(userId: string): Promise<number> {
        return userTokenRepository.getActiveTokenCount(userId, TokenType.REFRESH);
    }

    // ============ PASSWORD RESET METHODS ============

    async forgetPassword(email: string): Promise<void> {
        console.log(`🔐 Password reset requested for email: ${email}`);

        const user = await userRepository.findByEmail(email);

        // Security: Always return success to prevent email enumeration
        if (!user) {
            console.log(`⚠️ User not found for email: ${email}, but returning success for security`);
            return;
        }

        // Revoke any existing forgot password tokens for this user
        await userTokenRepository.revokeAllUserTokensByType(
            user.userId,
            TokenType.FORGOT_PASSWORD,
            'new_reset_requested'
        );

        // Generate new forgot password token
        const expiryHours = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '3600000', 10) / (1000 * 60 * 60); // Convert ms to hours
        const expiresAt = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRY || '3600000', 10)); // Default 1 hour

        const tokenData = await userTokenRepository.createToken({
            userId: user.userId,
            tokenType: TokenType.FORGOT_PASSWORD,
            expiresAt,
        });

        // Construct reset link
        const resetLink = `${process.env.PASSWORD_RESET_URL}?token=${tokenData.token}`;

        // Send password reset email
        await emailService.sendPasswordResetEmail(user.userEmail, {
            userName: user.userName,
            resetLink,
            expiryHours
        });

        console.log(`✅ Password reset email sent to: ${email}`);
    }

    async validateResetToken(token: string): Promise<boolean> {
        return await userTokenRepository.isValid(token, TokenType.FORGOT_PASSWORD);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        console.log(`🔐 Password reset attempt with token`);

        const tokenData = await userTokenRepository.findValidToken(token, TokenType.FORGOT_PASSWORD);

        if (!tokenData) {
            console.log(`❌ Invalid or expired reset token`);
            throw new CustomError({
                message: "Invalid or expired reset token",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        const hashedPassword = await hash(newPassword);

        await userRepository.update(tokenData.userId, { userPassword: hashedPassword });

        await userTokenRepository.revokeToken(token, 'password_reset_completed');

        // Security: Revoke all refresh tokens (logout from all devices)
        await userTokenRepository.revokeAllUserTokensByType(
            tokenData.userId,
            TokenType.REFRESH,
            'password_changed'
        );

        console.log(`✅ Password reset successful for user ${tokenData.userId}`);
    }
}

export const authService = new AuthService();