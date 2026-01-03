import { Request, Response } from "express";
import { roleService } from "../services/role.service";
import { SuccessResponse } from "../utils/response/success-response";
import { StatusCodes } from "http-status-codes";

class RoleController {
    async createRole(req: Request, res: Response) {
        const { roleName, roleDesc } = req.body;
        const role = await roleService.createRole({ roleName, roleDesc });
        return res
            .status(StatusCodes.CREATED)
            .json(new SuccessResponse({ data: role, message: "Role created successfully" }));
    }

    async getAllRoles(req: Request, res: Response) {
        const roles = await roleService.findAllRoles();
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: roles }));
    }

    async assignRole(req: Request, res: Response) {
        const { userId, roleName } = req.body;
        const result = await roleService.assignRoleToUser(userId, roleName);
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result, message: "Role assigned successfully" }));
    }

    async removeRoleFromUser(req: Request, res: Response) {
        const { userId, roleName } = req.body;
        const result = await roleService.removeRoleByNameFromUser(userId, roleName);
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result, message: "Role removed successfully" }));
    }

    async removeRoleById(req: Request, res: Response) {
        const { roleId } = req.body;
        const result = await roleService.removeRoleById(roleId);
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result, message: "Role removed successfully" }));
    }

    async removeRoleByName(req: Request, res: Response) {
        const { roleName } = req.body;
        const result = await roleService.removeRoleByName(roleName);
        return res
            .status(StatusCodes.OK)
            .json(new SuccessResponse({ data: result, message: "Role removed successfully" }));
    }
}

export const roleController = new RoleController();
