import Joi from "joi";
import { generalFields } from "../middleware/validate-request";

export const confirmEmailSchema = {
    query: Joi.object().required().keys({
        token: Joi.string().required(),
    }),
};

export const requireEmailSchema = {
    body: Joi.object().required().keys({
        email: generalFields.email,
    }),
};
