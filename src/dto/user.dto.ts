import { User } from "../generated/prisma";

export class UserDTO {
  userId: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  isConfirmed: boolean;
  isActive: boolean;
  customerId: string | null = null;
  restaurantId: string | null = null;
  userRoles: string[] = [];

  constructor(
    user: User & { customer?: { customerId: string } } & {
      restaurant?: { restaurantId: string };
    } & { userRoles?: { role: { roleKey: string } }[] }
  ) {
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

    if (user.userRoles) {
      this.userRoles = user.userRoles.map((role) => role.role?.roleKey);
    }
  }
}
