import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomError } from "../errors/custom-error";
import { StatusCodes } from "http-status-codes";

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (typeof decoded === "string" || !decoded.userId) {
      throw new CustomError({
        message: "Invalid credentials!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    return decoded;
  } catch (error) {
    throw new CustomError({
      message: "You are not authorized to perform this action",
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  }
};
