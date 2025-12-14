import Joi from "joi";
import { generalFields } from "../middleware/validate-request";

export const signUpSchema = {
    body: Joi.object().required().keys({
        userName: generalFields.userName,
        userEmail: generalFields.email,
        userPassword: generalFields.password,
                userConfirmPassword: Joi.string()
                    .valid(Joi.ref("userPassword"))
                    .required()
                    .messages({
                        "any.only": "Passwords do not match",
                        "any.required": "Confirm password is required",
                    }),
        userPhoneNumber: Joi.number(),
    }),
};
