import { StatusCodes } from "http-status-codes";
import { userService } from "../services/user.service";
import { Request, Response } from "express";
import { SuccessResponse } from "../utils/response/success-response";

class UserController {
    async findUserWithRestaurant(req: Request, res: Response) {
        const userRole = req.body.userRole || req.query.userRole as string || "restaurant";
        const result = await userService.findUserWithRestaurant({ userId: req.user!.userId, userRole });

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }

    async updateUserById(req: Request, res: Response) {
        const result = await userService.updateUserById(req.user!.userId, req.body);

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

    async findUserById(req: Request, res: Response) {
        const result = await userService.findUserById(req.user!.userId);

        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result }));
    }

    async assignRoleToUser(req: Request, res: Response) {
        const { userId, roleName } = req.body;
        const result = await userService.assignRoleToUser(userId, roleName);
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result, message: "Role assigned successfully" }));
    }

    async removeRoleFromUser(req: Request, res: Response) {
        const { userId, roleName } = req.body;
        const result = await userService.removeRoleFromUser(userId, roleName);
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result, message: "Role removed successfully" }));
    }
}

export const userController = new UserController();