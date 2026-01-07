export interface createRestaurantDto {
    restaurantName: string
    restaurantBio: string
    restaurantLogo?: string
    isAvailable: boolean
    addressId: string
    managerId: string
}

export interface updateRestaurantRatingDto {
    restaurantId: string
    averageRating: number
    ratingCount: number
}

export interface searchMenuItemsFilterDto {
    menuItemName?: string
    menuItemDesc?: string
    minPrice?: number
    maxPrice?: number
}

export interface updateRestaurantDto {
    restaurantId: string
    restaurantName?: string
    restaurantBio?: string
    restaurantLogo?: string
    isAvailable?: boolean
    addressId?: string
    managerId?: string
}
