import Joi from "joi";

export const confirmEmailSchema = {
    params: Joi.object().required().keys({
        token: Joi.string().required(),
    }),
};
