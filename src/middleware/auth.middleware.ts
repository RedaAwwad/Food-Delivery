import { RequestHandler } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

export const isAuthorized = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if there is a 'Bearer token' provided in headers
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new CustomError({
        message: "No token provided",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // If there is no token provided send 403 (unauthorized) status code
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new CustomError({
        message: "No token provided",
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }

    // Verify the token & decode it to extract the user 'roles'
    const secret = process.env.JWT_SECRET || "default_secret";
    try {
      const decoded = jwt.verify(token, secret) as any;
      (req as any).user = decoded;

      if (roles.length > 0) {
        const userRoles = Array.isArray(decoded.roles) ? decoded.roles || [] : [decoded.role];

        const hasPermission = userRoles.some((role: string) => roles.includes(role));

        if (!hasPermission) {
          throw new CustomError({
            message: "The Role is Unauthorized",
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
