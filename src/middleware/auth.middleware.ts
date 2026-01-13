import { RequestHandler, Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.config";
import jwt from "jsonwebtoken";
import { getTokenFromHeaders } from "../utils/jwt/getTokenFromHeaders";
import { verifyToken } from "../utils/jwt/verifyToken";

export const isAuthorized = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const token = getTokenFromHeaders(req);

    if (!token) {
      throw new CustomError({
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // Verify the token & decode it to extract the user data
    const secret = process.env.JWT_SECRET || "default_secret";
    try {
      const decoded = jwt.verify(token, secret) as any;
      // Attach the decoded user data to the request object
      (req as any).user = decoded;

      if (roles.length > 0) {
        const userRoles = Array.isArray(decoded.roles) ? decoded.roles || [] : [decoded.role];

        const hasPermission = userRoles.some((role: string) => roles.includes(role));

        if (!hasPermission) {
          throw new CustomError({
            message: "You are not authorized to perform this action",
            statusCode: StatusCodes.FORBIDDEN,
          });
        }
      }

      next();
    } catch (error) {
      throw new CustomError({
        message: "Invalid token",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  };
};

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromHeaders(req);
  const userSession = verifyToken(token);

  if (!userSession || typeof userSession !== "object" || !userSession.userId) {
    throw new CustomError({
      message: "You are not authorized to perform this action!",
      statusCode: StatusCodes.UNAUTHORIZED,
    });
  }

  req.user = userSession;

  next();
};

export const tokenExtractor = (req: Request, res: Response, next: NextFunction) => {
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
