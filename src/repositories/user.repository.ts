import { prisma } from "../config/prisma.config";

export class UserRepository {
    async findUserWithRestaurant(userId:number , userRole:string) {
        return prisma.user.findUnique({
            where: { id: userId },
             include: {
                 restaurant: userRole === "restaurant" ? true : false,
           },
  });
    }
}
export const userRepository = new UserRepository()