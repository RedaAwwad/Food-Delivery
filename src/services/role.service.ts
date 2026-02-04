import { roleRepository } from "../repositories/role.repository";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { RoleKey } from "../generated/prisma/client";
import { InternalServerError } from "../utils/errors";

class RoleService {
  async createRole(data: { roleName: string; roleDesc?: string; roleKey: RoleKey }) {
    const existingRole = await roleRepository.findRoleByKey(data.roleKey);
    if (existingRole) {
      throw new CustomError({
        message: "Role with this key already exists",
        statusCode: StatusCodes.CONFLICT,
      });
    }
    return roleRepository.createRole(data);
  }

  async findAllRoles() {
    return roleRepository.findAll();
  }

  async findRoleByKey(roleKey: RoleKey) {
    return roleRepository.findRoleByKey(roleKey);
  }

  async removeRoleById(roleId: string) {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new CustomError({
        message: `Role '${roleId}' not found`,
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    try {
      return await roleRepository.removeRoleById(role.roleId);
    } catch (error: any) {
      if (error.code === "P2025") {
        // Prisma record not found
        throw new CustomError({
          message: "Role does not exist",
          statusCode: StatusCodes.NOT_FOUND,
        });
      } else {
        throw new CustomError({
          message: "Failed to remove role",
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }
    }
  }

  async removeRoleByName(roleKey: RoleKey) {
    const role = await roleRepository.findRoleByKey(roleKey);
    if (!role) {
      throw InternalServerError("Something went wrong!");
    }

    try {
      return await roleRepository.removeRoleByKey(role.roleKey);
    } catch (error: any) {
      if (error.code === "P2025") {
        // Prisma record not found
        throw new CustomError({
          message: "Role does not exist",
          statusCode: StatusCodes.NOT_FOUND,
        });
      } else {
        throw new CustomError({
          message: "Failed to remove role",
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }
    }
  }
}

export const roleService = new RoleService();
