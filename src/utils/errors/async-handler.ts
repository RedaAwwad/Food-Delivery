import { Request, Response, NextFunction, RequestHandler } from "express";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

const normalizeError = (err: unknown): CustomError => {
    if (err instanceof CustomError) return err;
    const e = new CustomError({
        message: (err as any)?.message || "Internal Server Error",
        statusCode: (err as any)?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    });
    // preserve original error for debugging
    (e as any).original = err;
    if ((err as any)?.stack) e.stack = (err as any).stack;
    return e;
}

export const asyncHandler = (
    API: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
    return (req, res, next) => {
        API(req, res, next).catch((err) => next(normalizeError(err)));
    };
};



export const globalErrorHandler = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // If it's your CustomError instance, use its statusCode & details
  const isCustom = (err as CustomError).statusCode !== undefined;

  const statusCode = isCustom
    ? (err as CustomError).statusCode
    : StatusCodes.INTERNAL_SERVER_ERROR;

  const payload: any = {
    message: isCustom ? (err as CustomError).message : "Internal Server Error",
  };

  if (isCustom && (err as CustomError).errors) {
    payload.errors = (err as CustomError).errors;
  }

  if (process.env.NODE_ENV === "development" || process.env.ENVIRONMENT === "dev") {
    // Safe to expose stack only in dev
    payload.stack = (err as any).stack;
    // Optionally include original error
    if ((err as any).original) payload.original = (err as any).original;
  }

  res.status(statusCode).json({ error: payload });
};