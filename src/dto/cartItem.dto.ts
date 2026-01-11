export interface CreateCartItemDTO {
    menuItemId: string;
    quantity: number;
}

export interface UpdateCartItemQuantityDTO {
    menuItemId: string;
    cartItemId: string;
    quantity: number;
}

export interface RemoveCartItemDTO {
    cartItemId: string;
}

