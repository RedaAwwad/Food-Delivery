import { Prisma, User } from "../generated/prisma/client";
import { userRepository } from "../repositories/user.repository";
import { roleService } from "./role.service";
import { ConflictError, InternalServerError, NotFoundError } from "../utils/errors";
import { ExtendedTransactionClient } from "../config/prisma.config";

class UserService {
  async findUserWithRestaurant(body: { userId: string; userRole: string }) {
    return await userRepository.findUserWithRestaurant(body.userId, body.userRole);
  }

  async createUser(data: any, tx?: ExtendedTransactionClient) {
    return await userRepository.createUser(data, tx);
  }

  async updateUserById(userId: string, data: any) {
    return await userRepository.updateUserById(userId, data);
  }

  async updateIsActive(userId: string) {
    return await userRepository.updateIsActive(userId);
  }

  async findAndUpdateUserByEmail(userId: string, email: string, data: any) {
    return await userRepository.findAndUpdateUserByEmail(userId, email, data);
  }

  async findUserByEmail<T = User>(email: string, select?: Prisma.UserSelect) {
    return await userRepository.findUserByEmail<T>(email, select);
  }

  async findUserById(userId: string, select?: Prisma.UserSelect) {
    return await userRepository.findUserById(userId, select);
  }

  async assignRoleToUser(userId: string, roleKey: string, tx?: ExtendedTransactionClient) {
    const roleExists = await roleService.findRoleByKey(roleKey as any);
    if (!roleExists) throw InternalServerError("Role definition not found");

    const hasRole = await userRepository.hasRole(userId, roleKey, tx);
    if (hasRole) throw ConflictError("User already has this role");

    await userRepository.assignRoleToUser(userId, roleKey, tx);
    return true;
  }

  async removeRoleFromUser(userId: string, roleKey: string, tx?: ExtendedTransactionClient) {
    const hasRole = await userRepository.hasRole(userId, roleKey, tx);
    if (!hasRole) throw NotFoundError("User does not have this role");

    await userRepository.removeRoleFromUser(userId, roleKey, tx);
    return true;
  }
}

export const userService = new UserService();
