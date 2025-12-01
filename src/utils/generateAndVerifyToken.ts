import jwt, { JwtPayload } from "jsonwebtoken";
import { GenerateOpts } from "../types/generate-token";
import { CustomError } from "./errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { VerifyOpts } from "../types/verify-token";

export const generateToken = ({
    payload = {},
    signature = process.env.TOKEN_KEY,
    expiresIn = "24h",
}: GenerateOpts = {}): string => {
    if (!signature) {
        throw new CustomError({
            message: "JWT signature (secret) is not configured",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        return jwt.sign(payload, signature, { expiresIn });
    } catch (err: any) {
        // Optionally wrap/normalize error
        throw new CustomError({
            message: err?.message || "Failed to generate token",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            errors: [{ message: err?.message }],
        });
    }
};

export const verifyToken = ({
    token = "",
    signature = process.env.TOKEN_KEY,
}: VerifyOpts = {}): JwtPayload | string => {
    if (!token) {
        throw new CustomError({
            message: "Token is required",
            statusCode: StatusCodes.UNAUTHORIZED,
        });
    }

    if (!signature) {
        throw new CustomError({
            message: "JWT signature (secret) is not configured",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        return jwt.verify(token, signature);
    } catch (err: any) {
        const payload: any = {
            message: "Invalid or expired token",
            statusCode: StatusCodes.UNAUTHORIZED,
        };
        if (err?.message) payload.errors = [{ message: err.message }];

        throw new CustomError(payload);
    }
};