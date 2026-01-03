import { MenuItem, Prisma } from "../generated/prisma";
export class searchMenuItemsFilterDto {
    menuItemName?:string
    menuItemDesc?:string
    minPrice?:number
    maxPrice?:number
}