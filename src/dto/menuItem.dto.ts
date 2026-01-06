export interface createMenuItemDto {
    menuCategoryId: string;
    menuItemName: string;
    menuItemImageUrl: string;
    menuItemDesc: string;
    price: number;
    stockQuantity: number;
}

export interface updateMenuItemDto {
    menuItemId: string;
    menuItemName?: string;
    menuItemImageUrl?: string;
    menuItemDesc?: string;
    price?: number;
    stockQuantity?: number;
}
