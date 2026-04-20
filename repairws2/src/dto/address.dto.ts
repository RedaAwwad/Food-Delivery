import { Address } from "../types/address.type";

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
