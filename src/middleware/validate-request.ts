import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

const validateRequest = (schema: ObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validated = await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    req.body = validated;

    next();
  };
};

export { validateRequest };
