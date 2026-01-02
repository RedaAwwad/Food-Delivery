/**
 * Error Handling System
 * 
 * A comprehensive, production-ready error handling system for Express/TypeScript applications.
 * 
 * @module errors
 * 
 * @example
 * ```typescript
 * // Import everything you need from a single location
 * import { 
 *   CustomError, 
 *   errorHandler, 
 *   asyncHandler,
 *   NotFoundError,
 *   UnauthorizedError 
 * } from './utils/errors';
 * 
 * // Use in your Express app
 * app.use(errorHandler);
 * 
 * // Use in routes
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await userService.findById(req.params.id);
 *   if (!user) throw NotFoundError('User');
 *   res.json(user);
 * }));
 * ```
 */

// Core error class
export { CustomError } from "./custom-error";

// Error handler middleware
export { errorHandler } from "./error-handler";

// Async handler wrapper
export { asyncHandler } from "./async-handler";

// Error factory functions
export {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    UnprocessableEntityError,
    InternalServerError,
    ServiceUnavailableError,
    TooManyRequestsError,
} from "./error-factories";

// Types
export type { ErrorCode, ErrorDetails, ErrorFormat, ErrorResponse } from "./types";
