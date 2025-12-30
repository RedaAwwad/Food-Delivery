import { RequestHandler, Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../utils/generateAndVerifyToken";
import { prisma } from "../config/prisma.config";

export const isAuthorized = (roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const userRoles = req.user?.roles || [];

        // Check if user has at least one of the required roles
        const hasRole = userRoles.some(role => roles.includes(role));

        if (!hasRole) {
            throw new CustomError({
                message: 'The Role is Unauthorized',
                statusCode: StatusCodes.FORBIDDEN
            });
        }
        next();
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new CustomError({
                message: "Authorization header required",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            throw new CustomError({
                message: "Access token is missing",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        const decoded = verifyAccessToken(token);

        if (typeof decoded === 'string') {
            throw new CustomError({
                message: "Invalid access token",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

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

        if (!user) {
            throw new CustomError({
                message: "User not found",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        // Map UserRoles to role names
        const roles = user.usersRoles.map(ur => ur.role.roleName);

        req.user = {
            userId: user.userId,
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

declare global {
    namespace Express {
        interface Request {
            accessToken?: string;
            refreshToken?: string;
            user: {
                userId: string;
                userName: string;
                userEmail: string;
                isAdmin?: boolean;
                roles: string[];
            }
        }
    }
}