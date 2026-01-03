import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const validateRequest = (schema: Joi.ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validated = await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    req.body = validated;
    next();
  };
};

export { validateRequest };
