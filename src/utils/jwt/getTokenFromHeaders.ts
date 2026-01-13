import { CustomError } from "../errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { Request } from "express";

export const getTokenFromHeaders = (req: Request): string => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] as string;
  }

  throw new CustomError({
    message: "You are not authorized to perform this action",
    statusCode: StatusCodes.UNAUTHORIZED,
  });
};
