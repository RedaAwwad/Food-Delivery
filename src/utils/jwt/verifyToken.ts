import jwt from "jsonwebtoken";
import { CustomError } from "../errors/custom-error";
import { StatusCodes } from "http-status-codes";

export const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(token, secret) as any;
    return decoded;
  } catch (error) {
    throw new CustomError({
      message: "You are not authorized to perform this action",
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  }
};
