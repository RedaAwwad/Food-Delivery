import { roleRepository } from "../repositories/role.repository";
import { userRoleRepository } from "../repositories/user-role.repository";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { Prisma, RoleKey } from "../generated/prisma";
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

  async assignRoleToUser(userId: string, roleKey: RoleKey, tx?: Prisma.TransactionClient) {
    const role = await roleRepository.findRoleByKey(roleKey);

    if (!role) {
      throw InternalServerError("Something went wrong!");
    }

    try {
      return await userRoleRepository.assignRole(userId, role.roleId, tx);
    } catch (error: any) {
      if (error.code === "P2002") {
        // Prisma unique constraint violation
        throw new CustomError({
          message: "User already has this role",
          statusCode: StatusCodes.CONFLICT,
        });
      }
      throw error;
    }
  }

  async removeRoleByNameFromUser(userId: string, roleKey: RoleKey) {
    const role = await roleRepository.findRoleByKey(roleKey);
    if (!role) {
      throw InternalServerError("Something went wrong!");
    }

    try {
      return await userRoleRepository.removeRole(userId, role.roleId);
    } catch (error: any) {
      if (error.code === "P2025") {
        // Prisma record not found
        throw new CustomError({
          message: "User does not have this role",
          statusCode: StatusCodes.NOT_FOUND,
        });
      }
      throw error;
    }
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
