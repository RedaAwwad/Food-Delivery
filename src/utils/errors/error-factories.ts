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
    message: string = "Unauthorized",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.UNAUTHORIZED,
        code: "ERR_UNAUTHORIZED",
        ...(errors && { errors }),
    });
};

export const ForbiddenError = (
    message: string = "Forbidden",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.FORBIDDEN,
        code: "ERR_FORBIDDEN",
        ...(errors && { errors }),
    });
};

export const NotFoundError = (
    resource: string = "Resource",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message: `${resource} not found`,
        statusCode: StatusCodes.NOT_FOUND,
        code: "ERR_NOT_FOUND",
        ...(errors && { errors }),
    });
};


export const ConflictError = (
    message: string = "Conflict",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.CONFLICT,
        code: "ERR_CONFLICT",
        ...(errors && { errors }),
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
    message: string = "Internal Server Error",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        code: "ERR_INTERNAL",
        ...(errors && { errors }),
    });
};


export const ServiceUnavailableError = (
    message: string = "Service Unavailable",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.SERVICE_UNAVAILABLE,
        code: "ERR_SERVICE_UNAVAILABLE",
        ...(errors && { errors }),
    });
};

export const TooManyRequestsError = (
    message: string = "Too many requests",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        code: "ERR_TOO_MANY_REQUESTS",
        ...(errors && { errors }),
    });
};