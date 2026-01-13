import { CustomError } from "../errors";
import jwt, { Secret } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { TokenPayload } from "../../types/token";

export const generateToken = (
  payload: TokenPayload,
  expiresIn: string = "7d",
  tokenType: "ACCESS" | "REFRESH" = "ACCESS",
  secret: string = process.env.JWT_SECRET || "default_secret"
): string => {
  try {
    return (jwt as any).sign({ ...payload, tokenType }, secret as Secret, {
      expiresIn,
    });
  } catch (err: any) {
    throw new CustomError({
      message: "Internal server error!",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
