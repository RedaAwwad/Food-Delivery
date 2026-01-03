export type TokenType = "VERIFICATION" | "REFRESH" | "FORGOT_PASSWORD";

export interface TokenPayload {
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: string;
  [key: string]: any;
}

export interface GenerateTokenOpts {
  payload: TokenPayload;
  expiresIn?: string | number;
  signature?: string;
}

export interface VerifyTokenOpts {
  token: string;
  signature?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface CreateRefreshTokenData {
  userId: string;
  token: string;
  expiresAt: Date;
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceType?: string | null;
}

export interface CreateTokenData {
  userId: string;
  tokenType: TokenType;
  expiresAt: Date;
  token?: string; // Optional - will be generated if not provided
}

export interface RefreshTokenFilter {
  userId?: string;
  isRevoked?: boolean;
  expired?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: {
    userId: string;
    userName: string;
    userEmail: string;
  };
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: Date;
  user: {
    userId: string;
    userName: string;
    userEmail: string;
  };
}

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge?: number;
  path?: string;
  domain?: string;
}

export interface CookieData {
  name: string;
  value: string;
  options: CookieOptions;
}

export interface AuthResponse {
  data: LoginResponse | RefreshResponse | any;
  cookies?: CookieData[];
  clearCookies?: string[];
}

// export interface AuthUser {
//   userId: string;
//   userName: string;
//   userEmail: string;
//   isAdmin?: boolean;
//   role?: string;
// }
