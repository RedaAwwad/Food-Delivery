import { User } from "../generated/prisma";
import { userRepository } from "../repositories/user.repository";

class UserService {
  async findUserWithRestaurant(body: { userId: string; userRole: string }) {
    return await userRepository.findUserWithRestaurant(body.userId, body.userRole);
  }

  async getUserByRestaurantId(
    userId: string,
    restaurantId: string
  ): Promise<Pick<User, "userId" | "userName" | "userEmail" | "restaurant"> | null> {
    return await userRepository.getUserByRestaurantId(userId, restaurantId);
  }

  async getUserByCustomerId(
    userId: string,
    customerId: string
  ): Promise<Pick<User, "userId" | "userName" | "userEmail" | "customer"> | null> {
    return await userRepository.getUserByCustomerId(userId, customerId);
  }
}

export const userService = new UserService();
