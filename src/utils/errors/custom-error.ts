import { ErrorFormat, ErrorDetails } from "./types"; // adapt import if needed

class CustomError extends Error {
  statusCode: number;
  errors?: ErrorDetails[];

  constructor({ message, statusCode = 500, errors }: ErrorFormat) {
    super(message);
    this.name = "CustomError";
    this.statusCode = statusCode;
    // this.errors = errors;
    if (errors) this.errors = errors;
    // capture stack if supported
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

export { CustomError };


// class CustomError extends Error {
//   message: string;
//   statusCode: number;
//   errors?: ErrorDetails[];

//   constructor({ message, statusCode, errors }: ErrorFormat) {
//     super();
//     this.message = message;
//     this.statusCode = statusCode;
//     this.errors = errors as ErrorDetails[];
//   }
// }

// export { CustomError };

