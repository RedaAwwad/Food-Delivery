import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { CustomError } from "./custom-error";

/**
 * Global error handler middleware for Express
 * 
 * Handles three types of errors:
 * 1. Joi validation errors - Returns 422 with validation details
 * 2. CustomError instances - Returns error with specified status code
 * 3. Generic errors - Returns 500 Internal Server Error
 * 
 * In development mode, includes stack traces and original error details
 * 
 * @param {Error | CustomError} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @example
 * ```typescript
 * // In your Express app setup
 * app.use(errorHandler);
 * ```
 */
export const errorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV === "development" || process.env.ENVIRONMENT === "dev";

  // Handle Joi validation errors
  if (Joi.isError(err)) {
    const payload = {
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      message: "Validation error",
      errors: err.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      })),
    };

    if (isDev) {
      (payload as any).stack = err.stack;
    }

    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ error: payload });
    return;
  }

  // Handle CustomError instances
  if (err instanceof CustomError) {
    const payload: any = {
      statusCode: err.statusCode,
      message: err.message,
    };

    if (err.errors) {
      payload.errors = err.errors;
    }

    if (isDev) {
      payload.stack = err.stack;
      if ((err as any).original) {
        payload.original = (err as any).original;
      }
    }

    res.status(err.statusCode).json({ error: payload });
    return;
  }

  // Handle generic errors
  const payload: any = {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Internal Server Error",
  };

  if (isDev) {
    payload.stack = err.stack;
    if ((err as any).original) {
      payload.original = (err as any).original;
    }
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: payload });
};
