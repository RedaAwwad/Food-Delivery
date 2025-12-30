import { CustomError } from "./custom-error";
import { ErrorDetails } from "./types";
import { StatusCodes } from "http-status-codes";

/**
 * Error factory functions for common HTTP errors
 * These provide a convenient way to create properly configured CustomError instances
 */

/**
 * Creates a 400 Bad Request error
 * @param {string} message - Error message
 * @param {ErrorDetails[]} errors - Optional detailed errors
 * @returns {CustomError}
 * 
 * @example
 * throw BadRequestError("Invalid request parameters");
 */
export const BadRequestError = (
    message: string = "Bad Request",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.BAD_REQUEST,
        code: "ERR_BAD_REQUEST",
        ...(errors && { errors }),
    });
};

/**
 * Creates a 401 Unauthorized error
 * @param {string} message - Error message
 * @returns {CustomError}
 * 
 * @example
 * throw UnauthorizedError("Invalid credentials");
 */
export const UnauthorizedError = (
    message: string = "Unauthorized"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.UNAUTHORIZED,
        code: "ERR_UNAUTHORIZED",
    });
};

/**
 * Creates a 403 Forbidden error
 * @param {string} message - Error message
 * @returns {CustomError}
 * 
 * @example
 * throw ForbiddenError("You don't have permission to access this resource");
 */
export const ForbiddenError = (
    message: string = "Forbidden"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.FORBIDDEN,
        code: "ERR_FORBIDDEN",
    });
};

/**
 * Creates a 404 Not Found error
 * @param {string} resource - Name of the resource that wasn't found
 * @returns {CustomError}
 * 
 * @example
 * throw NotFoundError("User");
 * // Results in: "User not found"
 */
export const NotFoundError = (resource: string = "Resource"): CustomError => {
    return new CustomError({
        message: `${resource} not found`,
        statusCode: StatusCodes.NOT_FOUND,
        code: "ERR_NOT_FOUND",
    });
};

/**
 * Creates a 409 Conflict error
 * @param {string} message - Error message
 * @returns {CustomError}
 * 
 * @example
 * throw ConflictError("Email already exists");
 */
export const ConflictError = (
    message: string = "Conflict"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.CONFLICT,
        code: "ERR_CONFLICT",
    });
};

/**
 * Creates a 422 Unprocessable Entity error (typically for validation errors)
 * @param {string} message - Error message
 * @param {ErrorDetails[]} errors - Detailed validation errors
 * @returns {CustomError}
 * 
 * @example
 * throw UnprocessableEntityError("Validation failed", [
 *   { message: "Email is required", path: ["email"] },
 *   { message: "Password too short", path: ["password"] }
 * ]);
 */
export const UnprocessableEntityError = (
    message: string = "Validation failed",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        code: "ERR_VALIDATION",
        ...(errors && { errors }),
    });
};

/**
 * Creates a 500 Internal Server Error
 * @param {string} message - Error message
 * @returns {CustomError}
 * 
 * @example
 * throw InternalServerError("Database connection failed");
 */
export const InternalServerError = (
    message: string = "Internal Server Error"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: "ERR_INTERNAL",
    });
};

/**
 * Creates a 503 Service Unavailable error
 * @param {string} message - Error message
 * @returns {CustomError}
 * 
 * @example
 * throw ServiceUnavailableError("Payment service is temporarily unavailable");
 */
export const ServiceUnavailableError = (
    message: string = "Service Unavailable"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        code: "ERR_SERVICE_UNAVAILABLE",
    });
};
