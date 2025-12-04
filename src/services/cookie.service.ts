import { Response } from "express";
import { CookieData, CookieOptions } from "../types/token";

class CookieService {
    private readonly DEFAULT_OPTIONS: CookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    };

    setCookie(res: Response, name: string, value: string, options?: Partial<CookieOptions>): void {
        const cookieOptions: CookieOptions = {
            ...this.DEFAULT_OPTIONS,
            ...options
        };

        res.cookie(name, value, cookieOptions as any);
    }

    setCookies(res: Response, cookies: CookieData[]): void {
        cookies.forEach(cookie => {
            this.setCookie(res, cookie.name, cookie.value, cookie.options);
        });
    }

    clearCookie(res: Response, name: string, options?: Partial<CookieOptions>): void {
        const clearOptions = {
            ...this.DEFAULT_OPTIONS,
            ...options,
            maxAge: 0,
            expires: new Date(0)
        };

        res.clearCookie(name, clearOptions as any);
    }

    clearCookies(res: Response, names: string[], options?: Partial<CookieOptions>): void {
        names.forEach(name => {
            this.clearCookie(res, name, options);
        });
    }

    getCookieValue(req: any, name: string): string | undefined {
        return req.cookies?.[name];
    }

    // Factory method for common auth cookies
    createRefreshTokenCookie(value: string): CookieData {
        return {
            name: 'refreshToken',
            value,
            options: {
                ...this.DEFAULT_OPTIONS,
                maxAge: (parseInt(process.env.REFRESH_TOKEN_EXPIRY || '15', 10)) * 24 * 60 * 60 * 1000, // 15 days
                path: `/api/${process.env.API_VERSION || "v1"}/auth/refresh-token`
            }
        };
    }
}

export const cookieService = new CookieService();