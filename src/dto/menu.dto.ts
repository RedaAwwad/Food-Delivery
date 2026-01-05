export interface createMenuDto {
    restaurantId: string;
    menuDesc: string;
    isActive: boolean;
}

export interface updateMenuDto {
    menuId: string;
    menuDesc?: string;
    isActive?: boolean;
}
