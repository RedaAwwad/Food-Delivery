import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { CustomError } from "./errors/custom-error";
import { TokenPayload, TokenPair } from "../types/token";
import { BadRequestError, InternalServerError, UnauthorizedError } from "./errors";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.TOKEN_KEY || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "15d";

export const generateAccessToken = (payload: TokenPayload, expiresIn?: string | number): string => {
    if (!ACCESS_TOKEN_SECRET) {
        throw InternalServerError("Access token secret is not configured");
    }

    try {
        return (jwt as any).sign(
            { ...payload, tokenType: "access" },
            ACCESS_TOKEN_SECRET as Secret,
            { expiresIn: expiresIn || ACCESS_TOKEN_EXPIRY }
        );
    } catch (err: any) {
        throw BadRequestError(err?.message || "Failed to generate access token");
    }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    if (!REFRESH_TOKEN_SECRET) {
        throw InternalServerError("Refresh token secret is not configured");
    }

    try {
        return (jwt as any).sign(
            { ...payload, tokenType: "refresh" },
            REFRESH_TOKEN_SECRET as Secret,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
    } catch (err: any) {
        throw BadRequestError(err?.message || "Failed to generate refresh token");
    }
};

export const generateTokenPair = (payload: TokenPayload): TokenPair => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Calculate expiration dates
    const now = new Date();
    const accessTokenExpiresAt = new Date(now.getTime() + parseInt(ACCESS_TOKEN_EXPIRY, 10) * 60 * 1000); // 15 minutes
    const refreshTokenExpiresAt = new Date(now.getTime() + parseInt(REFRESH_TOKEN_EXPIRY, 10) * 24 * 60 * 60 * 1000); // 15 days

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
    };
};

export const verifyAccessToken = (token: string): JwtPayload | string => {
    if (!token) {
        throw UnauthorizedError("Access token is required");
    }

    if (!ACCESS_TOKEN_SECRET) {
        throw InternalServerError("Access token secret is not configured");
    }

    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw UnauthorizedError("Access token expired");
        }

        const errors = err?.message ? [{ message: err.message }] : undefined;
        throw UnauthorizedError("Invalid access token", errors);
    }
};

export const verifyRefreshToken = (token: string): JwtPayload | string => {
    if (!token) {
        throw UnauthorizedError("Refresh token is required");
    }

    if (!REFRESH_TOKEN_SECRET) {
        throw InternalServerError("Refresh token secret is not configured");
    }

    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

        // Additional check for token type
        if (typeof decoded !== 'string' && decoded.tokenType !== 'refresh') {
            throw UnauthorizedError("Invalid token type");
        }

        return decoded;
    } catch (err: any) {
        if (err instanceof CustomError) throw err;

        if (err.name === "TokenExpiredError") {
            throw UnauthorizedError("Refresh token expired");
        }

        const errors = err?.message ? [{ message: err.message }] : undefined;
        throw UnauthorizedError("Invalid refresh token", errors);
    }
};

export const generateJwtTokenForGeneralUse = (payload: TokenPayload, expiresIn?: string | number): string => {
    return generateAccessToken(payload, expiresIn);
}

export const verifyJwtTokenForGeneralUse = (token: string): JwtPayload | string => {
    return verifyAccessToken(token);
}
