import { CustomError } from "./custom-error";
import { ErrorDetails } from "./types";
import { StatusCodes } from "http-status-codes";


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

export const UnauthorizedError = (
    message: string = "Unauthorized"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.UNAUTHORIZED,
        code: "ERR_UNAUTHORIZED",
    });
};

export const ForbiddenError = (
    message: string = "Forbidden"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.FORBIDDEN,
        code: "ERR_FORBIDDEN",
    });
};

export const NotFoundError = (resource: string = "Resource"): CustomError => {
    return new CustomError({
        message: `${resource} not found`,
        statusCode: StatusCodes.NOT_FOUND,
        code: "ERR_NOT_FOUND",
    });
};


export const ConflictError = (
    message: string = "Conflict"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.CONFLICT,
        code: "ERR_CONFLICT",
    });
};

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

export const InternalServerError = (
    message: string = "Internal Server Error"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: "ERR_INTERNAL",
    });
};


export const ServiceUnavailableError = (
    message: string = "Service Unavailable"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        code: "ERR_SERVICE_UNAVAILABLE",
    });
};

export const TooManyRequestsError = (
    message: string = "Too many requests"
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        code: "ERR_TOO_MANY_REQUESTS",
    });
};