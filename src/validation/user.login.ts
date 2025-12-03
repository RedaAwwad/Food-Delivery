import Joi from "joi";
import { generalFields } from "../middleware/validate-request";

export const logInSchema = {
  body: Joi.object().required().keys({
      email: generalFields.email,
      password: generalFields.password,
    }),
};