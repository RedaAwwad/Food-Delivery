import * as jwt from "jsonwebtoken";
import { TokenPayload } from "../types/token";
import { InternalServerError, UnauthorizedError } from "./errors/error-factories";

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "30d";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "15d";
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Generic Generation Function
const generateToken = (payload: TokenPayload, type: "ACCESS" | "REFRESH"): string => {
  const secret = type === "ACCESS" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  const expiresIn = type === "ACCESS" ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY;

  try {
    return jwt.sign(
      { ...payload, tokenType: type },
      secret as jwt.Secret,
      { expiresIn } as jwt.SignOptions
    );
  } catch (err: any) {
    console.error(err);
    throw InternalServerError("Internal server error!");
  }
};

// Generic Verification Function
const verifyToken = (
  token: string,
  type: "ACCESS" | "REFRESH",
  expectedTokenType?: string
): jwt.JwtPayload | string => {
  const secret = type === "ACCESS" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;

  if (!token) {
    throw UnauthorizedError(`${type} token is required`);
  }

  if (!secret) {
    throw InternalServerError(`${type} token secret is not configured`);
  }

  try {
    const decoded = jwt.verify(token, secret);

    if (expectedTokenType) {
      if (typeof decoded !== "string" && decoded.tokenType !== expectedTokenType) {
        throw UnauthorizedError("Invalid token type");
      }
    }

    return decoded;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw UnauthorizedError(`${type} token expired`);
    }

    const errors = err?.message ? [{ message: err.message }] : undefined;
    throw UnauthorizedError(`Invalid ${type.toLowerCase()} token`, errors);
  }
};

export const generateAccessToken = (payload: TokenPayload): string => {
  return generateToken(payload, "ACCESS");
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return generateToken(payload, "REFRESH");
};

export const verifyAccessToken = (token: string): jwt.JwtPayload | string => {
  return verifyToken(token, "ACCESS");
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload | string => {
  return verifyToken(token, "REFRESH");
};
