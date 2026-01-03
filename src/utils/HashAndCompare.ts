import bcrypt from "bcrypt";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

// type HashArgs = { plaintext?: string; salt?: string };
// type CompareArgs = { plaintext?: string; hashValue?: string };

export const hash = async (
    password?: string,
    salt: string | undefined = process.env.SALT_ROUNDS,
): Promise<string> => {
    if (!password) {
        throw new CustomError({
            message: "password is required",
            statusCode: StatusCodes.BAD_REQUEST,
        });
    }

    const rounds = parseInt(salt ?? "10", 10);
    if (!Number.isFinite(rounds) || rounds <= 0) {
        throw new CustomError({
            message: "Invalid SALT_ROUNDS configuration",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }

    try {
        return await bcrypt.hash(password, rounds);
    } catch (err: any) {
        throw new CustomError({
            message: "Failed to hash password",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            errors: err?.message,
        });
    }
};

export const compare = async (
    plaintext: string,
    hashValue: string
): Promise<boolean> => {
    if (!plaintext || !hashValue) {
        throw new CustomError({
            message: "Plaintext and hashValue are required",
            statusCode: StatusCodes.BAD_REQUEST,
        });
    }

    try {
        return await bcrypt.compare(plaintext, hashValue);
    } catch (err: any) {
        throw new CustomError({
            message: "Failed to compare values",
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            errors: err?.message,
        });
    }
};