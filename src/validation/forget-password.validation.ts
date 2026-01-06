import Joi from 'joi';

export const forgetPasswordSchema =Joi.object().required().keys({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email address',
                'any.required': 'Email is required'
            })
    })
