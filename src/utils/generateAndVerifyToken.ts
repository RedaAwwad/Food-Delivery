import jwt, { Secret } from "jsonwebtoken";
import { CustomError } from "./errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { TokenPayload, TokenPair } from "../types/token";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.TOKEN_KEY || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "15d";

export const generateAccessToken = (payload: TokenPayload, expiresIn?: string | number): string => {
  if (!ACCESS_TOKEN_SECRET) {
    throw new CustomError({
      message: "Access token secret is not configured",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  try {
    return (jwt as any).sign({ ...payload, tokenType: "access" }, ACCESS_TOKEN_SECRET as Secret, {
      expiresIn: expiresIn || ACCESS_TOKEN_EXPIRY,
    });
  } catch (err: any) {
    throw new CustomError({
      message: err?.message || "Failed to generate access token",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: err?.message }],
    });
  }
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  if (!REFRESH_TOKEN_SECRET) {
    throw new CustomError({
      message: "Refresh token secret is not configured",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  try {
    return (jwt as any).sign({ ...payload, tokenType: "refresh" }, REFRESH_TOKEN_SECRET as Secret, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
  } catch (err: any) {
    throw new CustomError({
      message: err?.message || "Failed to generate refresh token",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      errors: [{ message: err?.message }],
    });
  }
};

export const generateTokenPair = (payload: TokenPayload): TokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calculate expiration dates
  const now = new Date();
  const accessTokenExpiresAt = new Date(
    now.getTime() + parseInt(ACCESS_TOKEN_EXPIRY, 10) * 60 * 1000
  ); // 15 minutes
  const refreshTokenExpiresAt = new Date(
    now.getTime() + parseInt(REFRESH_TOKEN_EXPIRY, 10) * 24 * 60 * 60 * 1000
  ); // 15 days

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
  };
};

export const generateJwtTokenForGeneralUse = (
  payload: TokenPayload,
  expiresIn?: string | number
): string => {
  return generateAccessToken(payload, expiresIn);
};
