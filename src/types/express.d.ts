export { };

declare global {
    namespace Express {
        interface Request {
            accessToken?: string;
            refreshToken?: string;
            user?: {
                userId: string;
                customerId?: string;
                userName: string;
                userEmail: string;
                isAdmin?: boolean;
                roles: string[];
            };
        }
    }
}
