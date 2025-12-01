import Joi from "joi";
import { generalFields } from "../middleware/validate-request";

export const signUpSchema = {
    body: Joi.object().required().keys({
        userName: generalFields.userName,
        userEmail: generalFields.email,
        userPassword: generalFields.password,
        userConfirmPassword: generalFields.cpassword,
        userPhoneNumber: Joi.number(),
    }),
};
