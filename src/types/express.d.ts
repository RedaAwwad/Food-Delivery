import { Request } from "express";
import { UserSession } from "../types/user.type";

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
      refreshToken?: string;
    }
  }

  interface RequestWithUser<T = any> extends Request {
    body: T;
    user: UserSession;
  }
}

export {};
