import { Request, Response, NextFunction, RequestHandler } from "express";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";


const normalizeError = (err: unknown): CustomError => {
  if (err instanceof CustomError) return err;

  const e = new CustomError({
    message: (err as any)?.message || "Internal Server Error",
    statusCode: (err as any)?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  });

  (e as any).original = err;
  if ((err as any)?.stack) e.stack = (err as any).stack;

  return e;
};

export const asyncHandler = (
  API: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    API(req, res, next).catch((err) => next(normalizeError(err)));
  };
};