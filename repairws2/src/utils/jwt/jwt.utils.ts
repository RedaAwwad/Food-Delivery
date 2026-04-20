import { InternalServerError, UnauthorizedError } from "../errors";
import { Request } from "express";
import { TokenPayload } from "../../types/token";
import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { UserSession } from "../../types/user.type";
import { REFRESH_TOKEN_COOKIE_NAME } from "../constants";

class JWTUtils {
  private jwtSecret: string;
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "default_secret";
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "access_secret";
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
    this.accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "30d";
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "90d";
  }

  getTokenFromHeaders(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    return authHeader.split(" ")[1] ?? null;
  }

  getRefreshTokenFromCookies(req: Request, key: string = REFRESH_TOKEN_COOKIE_NAME): string | null {
    const refreshToken = req.cookies[key];
    if (!refreshToken) {
      return null;
    }

    return refreshToken;
  }

  getExpiryDate(type: "ACCESS" | "REFRESH" | "FORGOT_PASSWORD"): Date {
    const now = new Date();

    if (type === "REFRESH") {
      return new Date(now.getTime() + parseInt(this.refreshTokenExpiry, 10) * 24 * 60 * 60 * 1000);
    }

    if (type === "FORGOT_PASSWORD") {
      return new Date(now.getTime() + parseInt("3600000", 10));
    }

    return new Date(now.getTime() + parseInt(this.accessTokenExpiry, 10) * 24 * 60 * 60 * 1000);
  }

  generateToken(
    payload: Record<string, unknown> | TokenPayload,
    expiry: string,
    secret: string = this.jwtSecret
  ): string {
    try {
      return jwt.sign(payload, secret as Secret, { expiresIn: expiry } as SignOptions);
    } catch (err: any) {
      console.error(err);
      throw InternalServerError("Internal server error!");
    }
  }

  verifyToken<T = JwtPayload>(token: string, secret: string = this.jwtSecret): T {
    try {
      return jwt.verify(token, secret) as T;
    } catch (err: any) {
      console.log(err);
      if (err.name === "TokenExpiredError") {
        throw UnauthorizedError("Your token has expired!");
      }

      const errors = err?.message ? [{ message: err.message }] : undefined;
      throw UnauthorizedError("Invalid token!", errors);
    }
  }

  generateAccessToken(payload: UserSession): string {
    return this.generateToken(payload, this.accessTokenExpiry, this.accessTokenSecret);
  }

  generateRefreshToken(payload: UserSession): string {
    return this.generateToken(payload, this.refreshTokenExpiry, this.refreshTokenSecret);
  }

  verifyAccessToken<T = UserSession>(token: string): T {
    return this.verifyToken(token, this.accessTokenSecret) as T;
  }

  verifyRefreshToken<T = UserSession>(token: string): T {
    return this.verifyToken(token, this.refreshTokenSecret) as T;
  }
}

export const jwtUtils = new JWTUtils();
