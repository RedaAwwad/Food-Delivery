import { RequestHandler, Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateAndVerifyToken";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

export const isAuthorized = (roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const userRoles = req.user?.roles || [];

        // Check if user has at least one of the required roles
        const hasRole = userRoles.some(role => roles.includes(role));

        if (!hasRole)
            throw ForbiddenError("The Role is Unauthorized");

        next();
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.accessToken;

        if (!token)
            throw UnauthorizedError("Access token is missing");

        const decoded = verifyAccessToken(token);

        if (!decoded || typeof decoded === 'string')
            throw UnauthorizedError("Invalid access token");

        req.user = {
            userId: decoded.userId,
            userName: decoded.userName,
            userEmail: decoded.userEmail,
            isAdmin: decoded.isAdmin || false,
            roles: decoded.roles || []
        };

        next();

    } catch (error) {
        next(error);
    }
};

// Used in the InitiateApp.ts 
export const tokenExtractor = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) {
            req.accessToken = token;
        }
    }

    const refreshToken = req.cookies?.refreshToken ||
        (req.headers.authorization?.startsWith('Refresh ') ? req.headers.authorization.split(' ')[1] : undefined);

    if (refreshToken) {
        req.refreshToken = refreshToken;
    }

    next();
};

