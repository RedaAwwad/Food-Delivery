import { MenuItem, Prisma } from "../generated/prisma";
import { MenuCategory } from '../generated/prisma/index';
export class searchMenuItemsFilterDto {
    menuItemName?:string
    menuItemDesc?:string
    minPrice?:number
    maxPrice?:number
}
export type getRestaurantResponseDto =
  Prisma.RestaurantGetPayload<{
    select: {
      restaurantName: true
      restaurantLogo: true
      isAvailable: true

      menu: {
        include: {
          menuCategories: true
        }
      }

      rating: true
      address: true
    }
  }>
