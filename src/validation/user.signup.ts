import Joi from "joi";

export const signUpSchema = Joi.object({
  userName: Joi.string().required(),
  userEmail: Joi.string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  userPassword: Joi.string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) // at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    .required()
    .min(8)
    .max(32)
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password must be at most 32 characters long",
    }),
  userConfirmPassword: Joi.string().valid(Joi.ref("userPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
  userPhoneNumber: Joi.string().required(),
}).required();
