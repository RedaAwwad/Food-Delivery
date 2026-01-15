import { StatusCodes } from "http-status-codes";
import { CustomError, InternalServerError, UnauthorizedError } from "../errors";
import { Request } from "express";
import { TokenPayload } from "../../types/token";
import { sign, Secret, SignOptions, JwtPayload, verify } from "jsonwebtoken";

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

  getRefreshTokenFromCookies(req: Request): string | null {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return null;
    }

    return refreshToken;
  }

  getExpiryDate(tokenType: "ACCESS" | "REFRESH"): Date {
    const now = new Date();

    if (tokenType === "REFRESH") {
      return new Date(now.getTime() + parseInt(this.refreshTokenExpiry, 10) * 24 * 60 * 60 * 1000);
    }

    return new Date(now.getTime() + parseInt(this.accessTokenExpiry, 10) * 24 * 60 * 60 * 1000);
  }

  generateToken(payload: TokenPayload, expiry: string, secret: string = this.jwtSecret): string {
    try {
      return sign(payload, secret as Secret, { expiresIn: expiry } as SignOptions);
    } catch (err: any) {
      console.error(err);
      throw InternalServerError("Internal server error!");
    }
  }

  verifyToken(token: string, secret: string = this.jwtSecret): JwtPayload | string {
    try {
      return verify(token, secret);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw UnauthorizedError("Your token has expired!");
      }

      const errors = err?.message ? [{ message: err.message }] : undefined;
      throw UnauthorizedError("Invalid token!", errors);
    }
  }

  generateAccessToken(payload: TokenPayload): string {
    return this.generateToken(payload, this.accessTokenExpiry, this.accessTokenSecret);
  }

  generateRefreshToken(payload: TokenPayload): string {
    return this.generateToken(payload, this.refreshTokenExpiry, this.refreshTokenSecret);
  }

  verifyAccessToken(token: string): TokenPayload | string {
    return this.verifyToken(token, this.accessTokenSecret);
  }

  verifyRefreshToken(token: string): TokenPayload | string {
    return this.verifyToken(token, this.refreshTokenSecret);
  }
}

export const jwtUtils = new JWTUtils();
