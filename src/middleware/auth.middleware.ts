import { RequestHandler, Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../utils/generateAndVerifyToken";
import { prisma } from "../config/prisma.config";

export const isAuthorized = (roles: string[]): RequestHandler => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        // If user has no role or role is not in the allowed list
        if (!userRole || !roles.includes(userRole)) {
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
                // Add other fields if necessary to map to req.user
            }
        });

        if (!user) {
            throw new CustomError({
                message: "User not found",
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        }

        // TODO: Fetch role from DB if it's not in the User model directly
        // For now, we'll assume a default role or fetch it if it exists in a relation
        // const role = ... 

        req.user = {
            ...user,
            role: 'customer' // Placeholder: You should fetch the actual role
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
                role?: string;
            }
        }
    }
}