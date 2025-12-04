import { StatusCodes } from "http-status-codes";
import { userService } from "../services/user.service";
import { Request, Response } from "express";
import { SuccessResponse } from "../utils/response/success-response";

class UserController {
    async findUserWithRestaurant(req: Request, res: Response) {
        const result = await userService.findUserWithRestaurant(req.body);
        
        return res
            .status(StatusCodes.CREATED)
            .json(new SuccessResponse({ data: result }));
    }
}

export const userController = new UserController();