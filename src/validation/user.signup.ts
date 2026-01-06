import Joi from "joi";

export const signUpSchema = Joi.object({
  userName: Joi.string().required(),
  userEmail: Joi.string().email().required(),
  userPassword: Joi.string().min(8).required(),
  userConfirmPassword: Joi.string().valid(Joi.ref("userPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
  userPhoneNumber: Joi.string().min(10).required(),
});
