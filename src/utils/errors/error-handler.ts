import { Request, Response, NextFunction } from "express";
import { appConfig } from "../../config/app.config";
import { getErrorMessage } from "../helpers";
import Joi from "joi";
import { CustomError } from "./custom-error";

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
