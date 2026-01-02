import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import joi from "joi";
import { ValidationSchemas } from "../types/validationSchemas.type";
import { UnprocessableEntityError } from "../utils/errors";

export const generalFields = {
  userName: joi.string().required(),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)) // at least 8 characters, 1 uppercase, 1 lowercase, 1 number
    .required(),
  // cpassword: joi.string().valid(joi.ref("password")).required(),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
};

export const validateRequest =
  (schemas: ValidationSchemas) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (schemas.body) {
          const validatedBody = await schemas.body.validateAsync(req.body, {
            abortEarly: false,
            convert: true,
          });
          req.body = validatedBody;
        }

        if (schemas.params) {
          const validatedParams = await schemas.params.validateAsync(req.params, {
            abortEarly: false,
            convert: true,
          });
          req.params = validatedParams;
        }

        if (schemas.query) {
          const validatedQuery = await schemas.query.validateAsync(req.query, {
            abortEarly: false,
            convert: true,
          });
          req.query = validatedQuery;
        }

        return next();
      } catch (err: any) {
        if (Joi.isError(err)) {
          const errors = err.details.map((d) => ({
            message: d.message,
            path: d.path,
          }));

          return next(
            UnprocessableEntityError("Validation failed", errors)
          );
        }

        return next(err);
      }
    };

//  ============================================================  //

// export const validation = <T>(schema: {
//     body?: joi.ObjectSchema<T>;
//     params?: joi.ObjectSchema;
//     query?: joi.ObjectSchema;
// }) => {
//     return (req: Request, res: Response, next: NextFunction) => {
//         for (const key of ["body", "params", "query"] as const) {
//             if (schema[key]) {
//                 const validationResult = schema[key].validate(req[key], {
//                     abortEarly: false,
//                 });
//                 if (validationResult?.error) {
//                     return res.json({
//                         message: "Validation Err",
//                         validationErr: validationResult.error.details,
//                     });
//                 }
//             }
//         }
//         return next();
//     };
// };










