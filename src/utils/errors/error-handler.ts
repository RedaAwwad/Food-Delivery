import { Request, Response, NextFunction } from "express";
import { appConfig } from "../../config/app.config";
import { getErrorMessage } from "../helpers";
import Joi from "joi";
import { CustomError } from "./custom-error";
import { StatusCodes } from "http-status-codes";
import { ErrorFormat } from "./types";

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent || appConfig().debug) {
    next(error);
    return;
  }

  if (Joi.isError(error)) {
    const validationError: { error: ErrorFormat } = {
      error: {
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        message: "Validation error!",
        errors: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })),
      },
    };

    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(validationError);
    return;
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      error: {
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
      },
    });
    return;
  }

  const SERVER_ERROR: { error: ErrorFormat } = {
    error: {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: getErrorMessage(error) || "Internal Server Error",
    },
  };
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(SERVER_ERROR);
};

export { errorHandler };
