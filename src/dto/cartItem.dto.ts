import { CartItem } from "../generated/prisma";

export type CreateCartItemDTO = Pick<CartItem , 'menuItemId'| 'quantity' | 'price'>