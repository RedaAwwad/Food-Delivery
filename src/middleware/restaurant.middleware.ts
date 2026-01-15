import { RequestHandler } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { Role } from "../generated/prisma";
import { jwtUtils } from "../utils/jwt/jwt.utils";

export const isRestaurantManager = (): RequestHandler => {
  return (req, res, next) => {
    const token = jwtUtils.getTokenFromHeaders(req);

    if (!token) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const decoded = jwtUtils.verifyAccessToken(token);
    (req as any).user = decoded;

    const hasPermission = decoded.roles.some((role: Role) => role.roleKey === "RESTAURANT_MANAGER");
    if (!hasPermission) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.FORBIDDEN,
      });
    }

    next();
  };
};
