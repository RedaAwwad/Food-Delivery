import { RequestHandler } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { jwtUtils } from "../utils/jwt/jwt.utils";

export const isCustomer = (): RequestHandler => {
  return (req, res, next) => {
    const token = jwtUtils.getTokenFromHeaders(req);

    if (!token) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    const hasPermission = (decoded as { userRoles: string[] }).userRoles.some(
      (roleKey: string) => roleKey === "CUSTOMER"
    );
    if (!hasPermission) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.FORBIDDEN,
      });
    }

    next();
  };
};
