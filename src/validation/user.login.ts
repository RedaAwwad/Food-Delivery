import Joi from "joi";

export const logInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
