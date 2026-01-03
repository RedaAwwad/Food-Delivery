import jwt, { Jwt, JwtPayload, SignOptions, Secret } from "jsonwebtoken";
import { CustomError } from "./errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { TokenPayload, TokenPair } from "../types/token";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.TOKEN_KEY || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "15d";

export const generateAccessToken = (payload: TokenPayload, expiresIn?: string | number): string => {
    if (!ACCESS_TOKEN_SECRET) {
        throw new CustomError({
            message: "Access token secret is not configured",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        return (jwt as any).sign(
            { ...payload, tokenType: "access" },
            ACCESS_TOKEN_SECRET as Secret,
            { expiresIn: expiresIn || ACCESS_TOKEN_EXPIRY }
        );
    } catch (err: any) {
        throw new CustomError({
            message: err?.message || "Failed to generate access token",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            errors: [{ message: err?.message }],
        });
    }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    if (!REFRESH_TOKEN_SECRET) {
        throw new CustomError({
            message: "Refresh token secret is not configured",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        return (jwt as any).sign(
            { ...payload, tokenType: "refresh" },
            REFRESH_TOKEN_SECRET as Secret,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
    } catch (err: any) {
        throw new CustomError({
            message: err?.message || "Failed to generate refresh token",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            errors: [{ message: err?.message }],
        });
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
        throw new CustomError({
            message: "Access token is required",
            statusCode: StatusCodes.UNAUTHORIZED,
        });
    }

    if (!ACCESS_TOKEN_SECRET) {
        throw new CustomError({
            message: "Access token secret is not configured",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            throw new CustomError({
                message: "Access token expired",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const payload: any = {
            message: "Invalid access token",
            statusCode: StatusCodes.UNAUTHORIZED,
        };
        if (err?.message) payload.errors = [{ message: err.message }];

        throw new CustomError(payload);
    }
};

export const verifyRefreshToken = (token: string): JwtPayload | string => {
    if (!token) {
        throw new CustomError({
            message: "Refresh token is required",
            statusCode: StatusCodes.UNAUTHORIZED,
        });
    }

    if (!REFRESH_TOKEN_SECRET) {
        throw new CustomError({
            message: "Refresh token secret is not configured",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

        // Additional check for token type
        if (typeof decoded !== 'string' && decoded.tokenType !== 'refresh') {
            throw new CustomError({
                message: "Invalid token type",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        return decoded;
    } catch (err: any) {
        if (err instanceof CustomError) throw err;

        if (err.name === "TokenExpiredError") {
            throw new CustomError({
                message: "Refresh token expired",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const payload: any = {
            message: "Invalid refresh token",
            statusCode: StatusCodes.UNAUTHORIZED,
        };
        if (err?.message) payload.errors = [{ message: err.message }];

        throw new CustomError(payload);
    }

};

export const generateJwtTokenForGeneralUse = (payload: TokenPayload, expiresIn?: string | number): string => {
    return generateAccessToken(payload, expiresIn);
}

export const verifyJwtTokenForGeneralUse = (token: string): JwtPayload | string => {
    return verifyAccessToken(token);
}
