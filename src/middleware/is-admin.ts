import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";

const isAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isAdmin) {
      return res.status(StatusCodes.FORBIDDEN).json(
        new CustomError({
          message: "Access denied. Admins only.",
          statusCode: StatusCodes.FORBIDDEN,
        })
      );
    }

    next();
  };
};

export { isAdmin };
