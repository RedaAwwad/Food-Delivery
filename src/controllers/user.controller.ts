import { StatusCodes } from "http-status-codes";
import { userService } from "../services/user.service";
import { Request, Response } from "express";
import { SuccessResponse } from "../utils/response/success-response";

class UserController {
    async findUserWithRestaurant(req: Request, res: Response) {
        const result = await userService.findUserWithRestaurant(req.body);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }

    async updateUser(req: Request, res: Response) {
        const result = await userService.updateUser(req.user!.userId, req.body);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }

    async updateIsActive(req: Request, res: Response) {
        const result = await userService.updateIsActive(req.user!.userId);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }

    async findAndUpdateUserByEmail(req: Request, res: Response) {
        const result = await userService.findAndUpdateUserByEmail(req.user!.userId, req.user!.userEmail, req.body);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }

    async findUserByIdWithRoles(req: Request, res: Response) {
        const result = await userService.findUserByIdWithRoles(req.body);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }
}

export const userController = new UserController();