import { RequestHandler, Request, Response, NextFunction } from "express";
import { CustomError, ForbiddenError } from "../utils/errors";
import { StatusCodes } from "http-status-codes";
import { jwtUtils } from "../utils/jwt/jwt.utils";

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
        message: "Invalid access token",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    req.user = userSession;

    next();
  } catch (error) {
    next(error);
  }
};

export const isAuthorized = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const userRoles: string[] = req.user?.userRoles || [];

    // Check if user has at least one of the required roles
    const hasRole = userRoles.some((roleKey: string) => roles.includes(roleKey));
    if (!hasRole) throw ForbiddenError("The Role is Unauthorized");

    next();
  };
};

// Used in the InitiateApp.ts
export const tokenValidator = (req: Request, res: Response, next: NextFunction) => {
  // const authHeader = req.headers.authorization;
  // if (authHeader?.startsWith("Bearer ")) {
  //   const token = authHeader.split(" ")[1];
  //   if (token) {
  //     req.accessToken = token;
  //   }
  // }

  // const refreshToken =
  //   req.cookies?.refreshToken ||
  //   (req.headers.authorization?.startsWith("Refresh ")
  //     ? req.headers.authorization.split(" ")[1]
  //     : undefined);

  // if (refreshToken) {
  //   req.refreshToken = refreshToken;
  // }

  next();
};
