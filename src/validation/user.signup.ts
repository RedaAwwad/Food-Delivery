import Joi from "joi";

export const signUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().min(10).required(),
  password: Joi.string().min(8).required(),
  passwordConfirmation: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
}).required();
