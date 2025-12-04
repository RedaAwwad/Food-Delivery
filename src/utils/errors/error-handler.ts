import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
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








// import { Request, Response, NextFunction } from "express";
// import { appConfig } from "../../config/app.config";
// import { getErrorMessage } from "../helpers";
// import Joi from "joi";
// import { CustomError } from "./custom-error";
// import { StatusCodes } from "http-status-codes";
// import { ErrorFormat } from "./types";

// const errorHandler = (
//   error: Error,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): void => {
//   if (res.headersSent || appConfig().debug) {
//     next(error);
//     return;
//   }

//   if (Joi.isError(error)) {
//     const validationError: { error: ErrorFormat } = {
//       error: {
//         statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
//         message: "Validation error!",
//         errors: error.details.map((detail) => ({
//           message: detail.message,
//           path: detail.path,
//         })),
//       },
//     };

//     res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(validationError);
//     return;
//   }

//   if (error instanceof CustomError) {
//     res.status(error.statusCode).json({
//       error: {
//         statusCode: error.statusCode,
//         message: error.message,
//         errors: error.errors,
//       },
//     });
//     return;
//   }

//   const SERVER_ERROR: { error: ErrorFormat } = {
//     error: {
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       message: getErrorMessage(error) || "Internal Server Error",
//     },
//   };

//   if (appConfig().debug) {
//     (SERVER_ERROR.error as any).stack = error.stack;
//     (SERVER_ERROR.error as any).original = (error as any).original;
//   }

//   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(SERVER_ERROR);
// };

// export { errorHandler };
