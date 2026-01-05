export interface createMenuCategoryDto {
    menuId: string;
    menuCategoryName: string;
    menuCategoryImageUrl: string;
}

export interface updateMenuCategoryDto {
    menuCategoryId: string;
    menuId: string;
    menuCategoryName?: string;
    menuCategoryImageUrl?: string;
}

