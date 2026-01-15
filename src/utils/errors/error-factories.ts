import { CustomError } from "./custom-error";
import { ErrorDetails } from "./error.types";
import { StatusCodes } from "http-status-codes";


export const BadRequestError = (
    message: string = "Bad Request",
    errors?: ErrorDetails[]
): CustomError => {
    return new CustomError({
        message,
        statusCode: StatusCodes.BAD_REQUEST,
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
        ...(errors && { errors }),
    });
};