import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { CustomError } from "../utils/errors";

const validateRequest = (
  schema: Joi.ObjectSchema,
  target: "body" | "query" = "body"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validated = await schema.validateAsync(req[target], {
      abortEarly: false,
    });

    if (!validated) {
      throw new CustomError({
        message: "Invalid request",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    if (target === "body") {
      req.body = validated;
    }

    next();
  };
};

export { validateRequest };
