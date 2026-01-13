import * as jwt from "jsonwebtoken";
import { CustomError } from "./errors/custom-error";
import { TokenPayload, TokenPair } from "../types/token";
import { BadRequestError, InternalServerError, UnauthorizedError } from "./errors";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.TOKEN_KEY || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "15d";

// Generic Generation Function
const generateToken = (
    payload: TokenPayload,
    secret: string | undefined,
    expiresIn: string | number,
    type: 'access' | 'refresh'
): string => {
    if (!secret) {
        throw InternalServerError(`${type.charAt(0).toUpperCase() + type.slice(1)} token secret is not configured`);
    }

    try {
        return jwt.sign(
            { ...payload, tokenType: type },
            secret as jwt.Secret,
            { expiresIn } as jwt.SignOptions
        );
    } catch (err: any) {
        throw BadRequestError(err?.message || `Failed to generate ${type} token`, err);
    }
};

// Generic Verification Function
const verifyToken = (
    token: string,
    secret: string | undefined,
    type: 'Access' | 'Refresh',
    expectedTokenType?: string
): jwt.JwtPayload | string => {
    if (!token) {
        throw UnauthorizedError(`${type} token is required`);
    }

    if (!secret) {
        throw InternalServerError(`${type} token secret is not configured`);
    }

    try {
        const decoded = jwt.verify(token, secret);

        if (expectedTokenType) {
            if (typeof decoded !== 'string' && decoded.tokenType !== expectedTokenType) {
                throw UnauthorizedError("Invalid token type");
            }
        }

        return decoded;
    } catch (err: any) {

        if (err.name === "TokenExpiredError") {
            throw UnauthorizedError(`${type} token expired`);
        }

        const errors = err?.message ? [{ message: err.message }] : undefined;
        throw UnauthorizedError(`Invalid ${type.toLowerCase()} token`, errors);
    }
};

export const generateAccessToken = (payload: TokenPayload, expiresIn?: string | number): string => {
    return generateToken(payload, ACCESS_TOKEN_SECRET, expiresIn || ACCESS_TOKEN_EXPIRY, 'access');
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return generateToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, 'refresh');
};

export const generateTokenPair = (payload: TokenPayload): TokenPair => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const now = new Date();

    const accessTokenExpiresAt = new Date(now.getTime() + parseInt(ACCESS_TOKEN_EXPIRY, 10) * 60 * 1000);
    const refreshTokenExpiresAt = new Date(now.getTime() + parseInt(REFRESH_TOKEN_EXPIRY, 10) * 24 * 60 * 60 * 1000);

    return {
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt
    };
};

export const verifyAccessToken = (token: string): jwt.JwtPayload | string => {
    return verifyToken(token, ACCESS_TOKEN_SECRET, 'Access');
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload | string => {
    return verifyToken(token, REFRESH_TOKEN_SECRET, 'Refresh', 'refresh');
};

export const generateJwtTokenForGeneralUse = (payload: TokenPayload, expiresIn?: string | number): string => {
    return generateAccessToken(payload, expiresIn);
}

export const verifyJwtTokenForGeneralUse = (token: string): jwt.JwtPayload | string => {
    return verifyAccessToken(token);
}
