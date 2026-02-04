import { RoleKey } from "../generated/prisma";
import { UserWithRelations } from "../types/user.type";

export class UserDTO {
  userId: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  isConfirmed: boolean;
  isActive: boolean;
  customerId: string | null = null;
  restaurantId: string | null = null;
  userRoles: RoleKey[] = [];

  constructor(user: UserWithRelations) {
    this.userId = user.userId;
    this.userName = user.userName;
    this.userEmail = user.userEmail;
    this.isAdmin = user.isAdmin;
    this.isConfirmed = user.isConfirmed;
    this.isActive = user.isActive;

    if (user.customer) {
      this.customerId = user.customer.customerId;
    }

    if (user.restaurant) {
      this.restaurantId = user.restaurant.restaurantId;
    }

    if (user.customerId) {
      this.customerId = user.customerId;
    }

    if (user.restaurantId) {
      this.restaurantId = user.restaurantId;
    }

    this.userRoles = user.roles || [];
  }
}
