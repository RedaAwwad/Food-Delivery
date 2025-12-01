import { Request, Response } from "express";
import { userService } from "../services/user.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";

class UserController {
    async signup(req: Request, res: Response) {
        const signupDto = req.body;

        const result = await userService.signup(signupDto);

        return res
            .status(StatusCodes.CREATED)
            .json(new SuccessResponse({ data: result }));
    }

    async login(req: Request, res: Response) {
        const loginDto = req.body;

        const result = await userService.login(loginDto);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }
}

export const userController = new UserController();