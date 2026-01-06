import Joi from "joi";

export const checkValidation = async <T>(schema: Joi.ObjectSchema, values: T) => {
  return await schema.validateAsync(values, {
    abortEarly: false,
  });
};
