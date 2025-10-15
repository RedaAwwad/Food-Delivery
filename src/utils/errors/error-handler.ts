import { Request, Response, NextFunction } from "express";
import { appConfig } from "../../config/app.config";
import { getErrorMessage } from "../helpers";
import Joi from "joi";
import { CustomError } from "./custom-error";

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent || appConfig().debug) {
    next(error);
    return;
  }

  if (Joi.isError(error)) {
    const validationError: { error: ErrorFormat } = {
      error: {
        statusCode: 422,
        code: "ERR_VALID",
        message: "Validation error!",
        errors: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })),
      },
    };

    res.status(422).json(validationError);
    return;
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: {
        statusCode: error.statusCode,
        code: error.code,
        message: error.message,
        errors: error.errors,
      },
    });
    return;
  }

  const SERVER_ERROR: { error: ErrorFormat } = {
    error: {
      statusCode: 500,
      code: "ERR_INTERNAL",
      message: getErrorMessage(error) || "Internal Server Error",
    },
  };
  res.status(500).json(SERVER_ERROR);
};

export { errorHandler };
