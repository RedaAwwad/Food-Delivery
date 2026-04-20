// Core error class
export { CustomError } from "./custom-error";
export { errorHandler } from "./error-handler";

// Types
export type { ErrorDetails, ErrorFormat, ErrorResponse } from "./error.types";

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
