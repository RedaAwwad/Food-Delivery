import { Request, Response, NextFunction } from "express";
import { CustomError, ForbiddenError } from "../utils/errors";
import { StatusCodes } from "http-status-codes";
import { jwtUtils } from "../utils/jwt/jwt.utils";
import { RoleKey } from "../generated/prisma/client";

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader) {
      token = jwtUtils.getTokenFromHeaders(req);
    }

    if (!token) {
      throw new CustomError({
        message: "Unauthorized to perform this action!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const userSession = jwtUtils.verifyAccessToken(token);

    if (!userSession || !userSession?.userId) {
      throw new CustomError({
        message: "Unauthorized to perform this action!",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    req.user = userSession;

    next();
  } catch (error) {
    next(error);
  }
};

export const isAuthorized = (roles: RoleKey[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.isAdmin) {
      return next();
    }

    const userRoles: RoleKey[] = req.user!.userRoles || [];
    const hasPermission = userRoles.some((roleKey: RoleKey) => roles.includes(roleKey));
    if (!hasPermission) {
      throw ForbiddenError("You are not authorized to perform this action!");
    }

    next();
  };
};
