export { };

declare global {
    namespace Express {
        interface Request {
            accessToken?: string;
            refreshToken?: string;
            user?: {
                userId: string;
                userName: string;
                userEmail: string;
                isAdmin?: boolean;
                roles: string[];
            };
        }
    }
}
