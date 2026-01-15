import { User } from "../generated/prisma";

type PickUser = Pick<
  User,
  "userId" | "userName" | "userEmail" | "isActive" | "isConfirmed" | "isAdmin"
>;

export interface UserWithRelations extends PickUser {
  userRoles: {
    role: {
      roleKey: string;
    };
  }[];
  customer?: {
    customerId: string;
  };
  restaurant?: {
    restaurantId: string;
  };
}
