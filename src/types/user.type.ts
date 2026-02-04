import { RoleKey, User } from "../generated/prisma";

type PickUser = Pick<
  User,
  "userId" | "userName" | "userEmail" | "isActive" | "isConfirmed" | "isAdmin" | "userPassword"
>;

export type UserSession = Pick<User, "userId" | "userName" | "userEmail"> & {
  isAdmin?: boolean;
  restaurantId?: string;
  customerId?: string;
  userRoles: RoleKey[];
};

export interface UserWithRelations extends PickUser {
  roles: RoleKey[];
  customer?: {
    customerId: string;
  };
  restaurant?: {
    restaurantId: string;
  };
  customerId?: string;
  restaurantId?: string;
}
