import { ErrorFormat, ErrorDetails, ErrorCode } from "./error.types";

/**
 * Custom error class for application-specific errors
 *
 * @example
 * ```typescript
 * // Basic usage
 * throw new CustomError({
 *   message: "User not found",
 *   statusCode: 404,
 *   code: "ERR_NOT_FOUND"
 * });
 *
 * // With validation errors
 * throw new CustomError({
 *   message: "Validation failed",
 *   statusCode: 422,
 *   code: "ERR_VALIDATION",
 *   errors: [
 *     { message: "Email is required", path: ["email"] },
 *     { message: "Password must be at least 8 characters", path: ["password"] }
 *   ]
 * });
 * ```
 */
class CustomError extends Error {
  /** HTTP status code */
  statusCode: number;
  /** Optional error code for categorization */
  code?: ErrorCode;
  /** Optional array of detailed errors (useful for validation) */
  errors?: ErrorDetails[];

  /**
   * Creates a new CustomError instance
   * @param {ErrorFormat} config - Error configuration object
   */
  constructor({ message, statusCode = 500, code, errors }: ErrorFormat) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
    if (code) this.code = code;
    if (errors) this.errors = errors;

    // Capture stack trace if supported (V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { CustomError };
