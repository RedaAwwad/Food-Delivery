export interface Address {
    addressId: string;
    customerId?: string | null;
    restaurantId?: string | null;
    street: string;
    city: string;
    area: string;
    zipCode: number;
    block: string;
    apartmentNumber: string;
    floor: string;
    latitude: number;
    longitude: number;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
}
