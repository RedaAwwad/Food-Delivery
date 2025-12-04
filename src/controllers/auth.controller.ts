import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { authService } from "../services/auth.service";

class AuthController {
    async signup(req: Request, res: Response) {
        const signupDto = req.body;

        const result = await authService.signup(signupDto);

        return res
            .status(StatusCodes.CREATED)
            .json(new SuccessResponse({ data: result }));
    }

    async login(req: Request, res: Response) {
        const loginDto = req.body;

        const result = await authService.login(loginDto, req);

        authService.applyCookies(res, result);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result.data }));
    }

    async refreshToken(req: Request, res: Response) {
        const refreshToken = req.refreshToken; // From tokenExtractor middleware

        const result = await authService.refreshToken(refreshToken);

        authService.applyCookies(res, result);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result.data }));
    }

    async logout(req: Request, res: Response) {
        const refreshToken = req.refreshToken;

        const result = await authService.logout(refreshToken);

        authService.applyCookies(res, result);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ message: "Logged out successfully" }));
    }

    async logoutAll(req: Request, res: Response) {
        const refreshToken = req.refreshToken;

        const result = await authService.logoutAll(refreshToken);

        authService.applyCookies(res, result);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ message: "Logged out from all devices" }));
    }

    async getActiveSessions(req: Request, res: Response) {
        const userId = req.user.userId;

        const result = await authService.getActiveSessions(userId);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result.data }));
    }
}

export const authController = new AuthController();