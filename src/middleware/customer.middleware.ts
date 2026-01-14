// import { RequestHandler } from "express";
// import { CustomError } from "../utils/errors/custom-error";
// import { StatusCodes } from "http-status-codes";
// import { verifyToken } from "../utils/jwt/verifyToken";
// import { getTokenFromHeaders } from "../utils/jwt/getTokenFromHeaders";
// import { Role } from "../generated/prisma";

// export const isCustomer = (): RequestHandler => {
//   return (req, res, next) => {
//     const token = getTokenFromHeaders(req);

//     if (!token) {
//       throw new CustomError({
//         message: "You are not authorized to perform this action",
//         statusCode: StatusCodes.UNAUTHORIZED,
//       });
//     }

//     const decoded = verifyToken(token);
//     (req as any).user = decoded;

//     const hasPermission = decoded.roles.some((role: Role) => role.roleKey === "CUSTOMER");
//     if (!hasPermission) {
//       throw new CustomError({
//         message: "You are not authorized to perform this action",
//         statusCode: StatusCodes.FORBIDDEN,
//       });
//     }

//     next();
//   };
// };
