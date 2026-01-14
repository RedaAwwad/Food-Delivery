import { Address } from "../generated/prisma";

export type CreateAddressDTO = Pick<
  Address,
  | "street"
  | "city"
  | "area"
  | "zipCode"
  | "block"
  | "apartmentNumber"
  | "floor"
  | "latitude"
  | "longitude"
> & {
  isPrimary?: boolean;
  restaurantId?: string;
  customerId?: string;
};

export type UpdateAddressDTO = Partial<CreateAddressDTO>;
