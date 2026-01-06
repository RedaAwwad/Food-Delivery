import Joi from "joi";

export const confirmEmailSchema = Joi.object().required().keys({
  token: Joi.string().required(),
});

export const requireEmailSchema = Joi.object().required().keys({
  email: Joi.string,
});
