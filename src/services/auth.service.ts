import { loginDTO } from "../dto/login.dto";
import { SignupDTO } from "../dto/signup.dto";
import { authRepository } from "../repositories/auth.repository";
import { Request, Response } from "express";
import { AuthResponse, CookieData, CookieOptions, DeviceInfo } from "../types/token";
import { CustomError } from "../utils/errors/custom-error";
import { refreshTokenRepository } from "../repositories/refresh-token.repository";
import { StatusCodes } from "http-status-codes";
import { generateAccessToken, generateRefreshToken, generateTokenPair, verifyRefreshToken } from "../utils/generateAndVerifyToken";
import { cookieService } from "./cookie.service";
import { compare } from "../utils/HashAndCompare";
import { prisma } from "../config/prisma.config";

class AuthService {
    private readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

    async signup(signupDto: SignupDTO) {
        return await authRepository.signup(signupDto);
    }

    async login(loginDto: loginDTO): Promise<AuthResponse> {
        const user = await authRepository.login(loginDto);

        // const refreshTokenCookie: CookieData = {
        //     name: this.REFRESH_TOKEN_COOKIE_NAME,
        //     value: loginResponse.refreshToken,
        //     options: this.COOKIE_OPTIONS
        // };

        const match = await compare(loginDto.password, user.userPassword);
        if (!match) {
            throw new CustomError({
                message: "Invalid email or password",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const activeUser = await prisma.user.update({
            where: { userId: user.userId },
            data: { isActive: true },
        });

        const tokenPair = generateTokenPair({
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
        });

        // Store refresh token in separate table
        await refreshTokenRepository.createRefreshToken({
            userId: user.userId,
            token: tokenPair.refreshToken,
            expiresAt: tokenPair.refreshTokenExpiresAt,
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
        // Use provided token or throw error
        const refreshToken = requestRefreshToken;

        if (!refreshToken) {
            throw new CustomError({
                message: "Refresh token is required",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        // Validate refresh token against database
        const isValid = await refreshTokenRepository.isValid(refreshToken);

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

        // Update refresh token in database
        const tokenData = await refreshTokenRepository.findByToken(refreshToken);
        if (tokenData) {
            await refreshTokenRepository.revokeToken(refreshToken, 'token_rotated');
            await refreshTokenRepository.createRefreshToken({
                userId: tokenData.userId,
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + parseInt(process.env.ACCESS_TOKEN_EXPIRY || '15', 10) * 24 * 60 * 60 * 1000), // 15 days
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

        // Validate against database
        const isValid = await refreshTokenRepository.isValid(refreshToken);

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
            await refreshTokenRepository.revokeToken(refreshToken, 'user_logout');
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

        // Get user from token
        const tokenData = await refreshTokenRepository.findByToken(refreshToken);

        if (!tokenData) {
            throw new CustomError({
                message: "Invalid token",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        await authRepository.logoutAll(tokenData.userId);

        // Prepare cookie clearance
        const clearCookies = [this.REFRESH_TOKEN_COOKIE_NAME];

        return {
            data: {},
            clearCookies,
        };
    }

    async getActiveSessions(userId: string): Promise<AuthResponse> {
        const sessions = await authRepository.getActiveSessions(userId);

        return {
            data: { sessions },
        };
    }

    async cleanupExpiredTokens(): Promise<void> {
        await refreshTokenRepository.deleteExpiredTokens();
        await refreshTokenRepository.deleteRevokedTokens();
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
            const tokenData = await refreshTokenRepository.findByToken(refreshToken);
            return tokenData?.userId || null;
        } catch (error) {
            return null;
        }
    }

    // Validate session is still active
    async validateSession(refreshToken: string): Promise<boolean> {
        return refreshTokenRepository.isValid(refreshToken);
    }

    // Get session count for user
    async getSessionCount(userId: string): Promise<number> {
        return refreshTokenRepository.getActiveSessionCount(userId);
    }
}
export const authService = new AuthService();