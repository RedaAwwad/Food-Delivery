import { roleRepository } from "../repositories/role.repository";
import { userRoleRepository } from "../repositories/user-role.repository";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

class RoleService {
  async createRole(data: { roleName: string; roleDesc?: string }) {
    const existingRole = await roleRepository.findByName(data.roleName);
    if (existingRole) {
      throw new CustomError({
        message: "Role with this name already exists",
        statusCode: StatusCodes.CONFLICT,
      });
    }
    return roleRepository.createRole(data);
  }

  async findAllRoles() {
    return roleRepository.findAll();
  }

  async assignRoleToUser(userId: string, roleName: string) {
    // 1. Verify User exists -> using simple findUnique from prisma via repository if available or we can rely on foreign key constraint error, but explicit check is better for error messages.
    // We added findUserByEmail, update, create in userRepo. Let's make sure we have findById or similar.
    // Existing userRepository has findUserWithRestaurant which finds by ID. We can use that or assumes FK handles it.
    // For better UX, let's verify role exists.

    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new CustomError({
        message: `Role '${roleName}' not found`,
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    try {
      return await userRoleRepository.assignRole(userId, role.roleId);
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

  async removeRoleByNameFromUser(userId: string, roleName: string) {
    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new CustomError({
        message: `Role '${roleName}' not found`,
        statusCode: StatusCodes.NOT_FOUND,
      });
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

  async removeRoleByName(roleName: string) {
    const role = await roleRepository.findByName(roleName);
    if (!role) {
      throw new CustomError({
        message: `Role '${roleName}' not found`,
        statusCode: StatusCodes.NOT_FOUND,
      });
    }

    try {
      return await roleRepository.removeRoleByName(role.roleName);
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
