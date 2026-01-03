import Joi from "joi";

export const signUpSchema =  Joi.object().required().keys({
        userName: Joi.string,
        userEmail: Joi.string,
        userPassword: Joi.string,
        userConfirmPassword: Joi.string()
            .valid(Joi.ref("userPassword"))
            .required()
            .messages({
                "any.only": "Passwords do not match",
                "any.required": "Confirm password is required",
            }),
        userPhoneNumber: Joi.string().required(),
    })

