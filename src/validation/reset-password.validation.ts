import Joi from "joi";

export const resetPasswordSchema = {
  body: Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    newPassword: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "New password is required",
    }),
  }),
};

// /orders/2647247
// /auth/email-verify?token=234234234234

/*
if(!token) {
    ds
}
*/
