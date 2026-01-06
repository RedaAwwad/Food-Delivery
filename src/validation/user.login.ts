import Joi from "joi";

export const logInSchema = Joi.object().required().keys({
  email: Joi.string,
  password: Joi.string,
});
