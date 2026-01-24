export const DEFAULT_ROLE_KEYS = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
  RESTAURANT_MANAGER: "RESTAURANT_MANAGER",
} as const;

export const USER_DEFAULT_SELECT = {
  userId: true,
  userName: true,
  userEmail: true,
  isAdmin: true,
  isConfirmed: true,
  isActive: true,
  customer: { select: { customerId: true } },
  restaurant: { select: { restaurantId: true } },
  userRoles: { select: { role: { select: { roleKey: true } } } },
};

export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token" as const;
