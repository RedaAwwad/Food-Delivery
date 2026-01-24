import { CookieOptions, Request, Response } from "express";

class CookieUtils {
  private static defaultOptions: CookieOptions = {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  static getCookie(req: Request, key: string): string {
    return req.cookies[key];
  }

  static setCookie(res: Response, key: string, value: string, options?: CookieOptions) {
    return res.cookie(key, value, { ...this.defaultOptions, ...options });
  }

  static deleteCookie(res: Response, key: string) {
    return res.clearCookie(key);
  }
}

export { CookieUtils };
