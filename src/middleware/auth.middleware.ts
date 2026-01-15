import { RequestHandler, Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateAndVerifyToken";
import { prisma } from "../config/prisma.config";
import jwt from "jsonwebtoken";
import { getTokenFromHeaders } from "../utils/jwt/getTokenFromHeaders";
import { CustomError, ForbiddenError, UnauthorizedError } from "../utils/errors";
import { StatusCodes } from "http-status-codes";

export const isAuthorized = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    // Check if user has at least one of the required roles
    const hasRole = userRoles.some((role) => roles.includes(role));

    if (!hasRole) throw ForbiddenError("The Role is Unauthorized");

    next();
  };
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError({
        message: "Unauthorized",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new CustomError({
        message: "Access token is missing",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    req.accessToken = token;

    const decoded = verifyAccessToken(token);

    if (typeof decoded === "string") {
      throw new CustomError({
        message: "Invalid access token",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }


    if (!decoded.user) {
      throw new CustomError({
        message: "User not found",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // Map UserRoles to role names
    const userRoles: any[] = decoded.user.usersRoles || [];
    const roles = userRoles.map(userRole => userRole.roleName);

    req.user = {
      userId: decoded.user.userId,
      userName: decoded.user.userName,
      userEmail: decoded.user.userEmail,
      isAdmin: decoded.user.isAdmin,
      roles: roles,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Used in the InitiateApp.ts
export const tokenValidator = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token) {
      req.accessToken = token;
    }
  }

  const refreshToken =
    req.cookies?.refreshToken ||
    (req.headers.authorization?.startsWith("Refresh ")
      ? req.headers.authorization.split(" ")[1]
      : undefined);

  if (refreshToken) {
    req.refreshToken = refreshToken;
  }

  next();
};
