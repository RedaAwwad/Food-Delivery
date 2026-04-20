import Joi from "joi";

export const confirmEmailSchema = Joi.object({
  token: Joi.string().required(),
}).required();

export const requireEmailSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
}).required();
