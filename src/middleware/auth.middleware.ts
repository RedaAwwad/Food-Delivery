import { RequestHandler, Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateAndVerifyToken";
import { prisma } from "../config/prisma.config";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

export const isAuthorized = (roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const userRoles = req.user?.roles || [];

        // Check if user has at least one of the required roles
        const hasRole = userRoles.some(role => roles.includes(role));

        if (!hasRole)
            throw ForbiddenError("Unauthorized");

        next();
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer "))
            throw UnauthorizedError("Authorization header required");


        const token = authHeader.split(" ")[1];
        if (!token)
            throw UnauthorizedError("Access token is missing");

        const decoded = verifyAccessToken(token);

        if (typeof decoded === 'string')
            throw UnauthorizedError("Invalid access token");

        req.accessToken = token;

        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
            select: {
                userId: true,
                userName: true,
                userEmail: true,
                isAdmin: true,
                usersRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user)
            throw UnauthorizedError("User not found");

        // Map UserRoles to role names
        const roles = user.usersRoles.map(ur => ur.role.roleName);

        req.user = {
            userId: user.userId,
            customerId: decoded.customerId,
            userName: user.userName,
            userEmail: user.userEmail,
            isAdmin: user.isAdmin,
            roles: roles
        };

        next();

    } catch (error) {
        next(error);
    }
};

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

