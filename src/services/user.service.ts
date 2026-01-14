import { userRepository } from "../repositories/user.repository";

class UserService {
    async findUserWithRestaurant(body: { userId: string; userRole: string }) {
        return await userRepository.findUserWithRestaurant(body.userId, body.userRole);
    }

    async createUser(data: any) {
        return await userRepository.createUser(data);
    }

    async updateUser(userId: string, data: any) {
        return await userRepository.updateUser(userId, data);
    }

    async updateIsActive(userId: string, isActive: boolean) {
        return await userRepository.updateIsActive(userId, isActive);
    }

    async findAndUpdateUserByEmail(email: string, data: any) {
        return await userRepository.findAndUpdateUserByEmail(email, data);
    }

    async findUserByEmail(email: string) {
        return await userRepository.findUserByEmail(email);
    }

    async findUserByEmailWithRoles(email: string) {
        return await userRepository.findUserByEmailWithRoles(email);
    }

    async findUserByIdWithRoles(userId: string) {
        return await userRepository.findUserByIdWithRoles(userId);
    }
}

export const userService = new UserService();