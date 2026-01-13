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
