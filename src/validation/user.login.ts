import Joi from "joi";

export const logInSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) // at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    .required(),
});