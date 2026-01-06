import { RequestHandler } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt/verifyToken";
import { getTokenFromHeaders } from "../utils/jwt/getTokenFromHeaders";
import { userService } from "../services/user.service";

export const isCustomer = (): RequestHandler => {
  return async (req, res, next) => {
    const token = getTokenFromHeaders(req);

    if (!token) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const decoded = verifyToken(token);
    const user = await userService.getUserByCustomerId(decoded.userId, decoded.customerId);

    if (!user) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.FORBIDDEN,
      });
    }

    (req as any).user = user;

    next();
  };
};
