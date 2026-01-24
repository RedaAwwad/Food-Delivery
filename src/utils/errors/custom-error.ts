import { ErrorFormat, ErrorDetails } from "./error.types";

class CustomError extends Error {
  statusCode: number;
  errors?: ErrorDetails[];

  constructor({ message, statusCode = 500, errors }: ErrorFormat) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
    if (errors) this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { CustomError };
