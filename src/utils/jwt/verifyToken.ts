import jwt from "jsonwebtoken";
import { CustomError } from "../errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { TokenPayload } from "../../types/token";

export const verifyToken = (token: string): TokenPayload => {
  try {
    const secret = process.env.JWT_SECRET || "default_secret";

    return jwt.verify(token, secret) as TokenPayload;
  } catch (error: any) {
    console.error(error);
    throw new CustomError({
      message: "You are not authorized to perform this action",
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  }
};
