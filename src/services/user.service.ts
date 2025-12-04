import { userRepository } from "../repositories/user.repository";

class UserService {
    async findUserWithRestaurant(body: { userId: string; userRole: string }) {
        return await userRepository.findUserWithRestaurant(body.userId, body.userRole);
    }
}

export const userService = new UserService();