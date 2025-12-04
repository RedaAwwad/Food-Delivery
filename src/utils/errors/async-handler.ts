import { Request, Response, NextFunction, RequestHandler } from "express";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";

/**
 * Normalizes any error into a CustomError instance
 * Preserves the original error for debugging purposes
 * 
 * @param {unknown} err - The error to normalize
 * @returns {CustomError} A CustomError instance
 */
const normalizeError = (err: unknown): CustomError => {
  if (err instanceof CustomError) return err;

  const e = new CustomError({
    message: (err as any)?.message || "Internal Server Error",
    statusCode: (err as any)?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
  });

  // Preserve original error for debugging
  (e as any).original = err;
  if ((err as any)?.stack) e.stack = (err as any).stack;

  return e;
};

/**
 * Wraps async route handlers to catch promise rejections
 * Automatically passes errors to Express error handling middleware
 * 
 * @param {Function} API - Async route handler function
 * @returns {RequestHandler} Express request handler
 * 
 * @example
 * ```typescript
 * // Wrap your async route handlers
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   if (!user) throw NotFoundError('User');
 *   res.json(user);
 * }));
 * ```
 */
export const asyncHandler = (
  API: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    API(req, res, next).catch((err) => next(normalizeError(err)));
  };
};