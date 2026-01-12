export type CartItemWithMenuItem = {
  cartItemId: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  // menuItem: {
  //   menuItemId: string;
  //   menuCategoryId: string;
  //   menuItemName: string;
  //   menuItemDesc: string;
  //   menuItemImageUrl: string;
  //   price: number;
  //   stockQuantity: number;
  //   isActive: boolean;
  //   createdAt: Date;
  //   updatedAt: Date;
  // };
};