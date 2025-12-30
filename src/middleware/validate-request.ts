import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema } from "joi";
import joi from "joi";
import { ValidationSchemas } from "../types/validationSchemas.type";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

const validateRequest = (schema: ObjectSchema) => {

  return async (req: Request, res: Response, next: NextFunction) => {
    const validated = await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    req.body = validated;
    console.log('middleware-1')
    next();
  };
};


// const validateRequest = (schema: ObjectSchema) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const validated = await schema.validateAsync(req.body, {
//       abortEarly: false,
//     });
//     req.body = validated;

//     next();
//   };
// };

// export { validateRequest };


// export const validateRequest =
//   (schemas: ValidationSchemas) =>
//     async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         if (schemas.body) {
//           const validatedBody = await schemas.body.validateAsync(req.body, {
//             abortEarly: false,
//             convert: true,
//           });
//           req.body = validatedBody;
//         }

//         if (schemas.params) {
//           const validatedParams = await schemas.params.validateAsync(req.params, {
//             abortEarly: false,
//             convert: true,
//           });
//           req.params = validatedParams;
//         }

//         if (schemas.query) {
//           const validatedQuery = await schemas.query.validateAsync(req.query, {
//             abortEarly: false,
//             convert: true,
//           });
//           req.query = validatedQuery;
//         }

//         return next();
//       } catch (err: any) {
//         if (Joi.isError(err)) {
//           const errors = err.details.map((d) => ({
//             message: d.message,
//             path: d.path,
//           }));

//           return next(
//             new CustomError({
//               message: "Validation error",
//               statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
//               errors,
//             })
//           );
//         }

//         return next(err);
//       }
//     };



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










