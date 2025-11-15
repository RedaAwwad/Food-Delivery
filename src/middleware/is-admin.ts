import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";

const isAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const checkedRole = "admin"; // TODO req.user?.role
    if (checkedRole !== "admin") {
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
