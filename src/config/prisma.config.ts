import { PrismaClient, Prisma } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import { v7 as uuidv7 } from "uuid";
import { Address } from "../types/address.type.js";
import { NotFoundError } from "../utils/errors/error-factories.js";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const baseClient = new PrismaClient({
  adapter,
  log: ["query", "error"],
});

const createAddressMethods = (modelName: "customer" | "restaurant") => {
  const tableName = modelName === "customer" ? "customers" : "restaurants";
  const idColumn = modelName === "customer" ? "customer_id" : "restaurant_id";

  return {
    async add(
      parentId: string,
      data: Omit<
        Address,
        | "addressId"
        | "createdAt"
        | "updatedAt"
        | "customerId"
        | "restaurantId"
        | "isPrimary"
      > & { isPrimary?: boolean }
    ): Promise<Address> {
      const addressId = uuidv7();

      // Object to be stored in DB (Clean, no parent IDs)
      const storedAddress = {
        addressId,
        street: data.street,
        city: data.city,
        area: data.area,
        zipCode: data.zipCode,
        block: data.block,
        apartmentNumber: data.apartmentNumber,
        floor: data.floor,
        latitude: data.latitude,
        longitude: data.longitude,
        isPrimary: data.isPrimary || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const addressJson = JSON.stringify(storedAddress);

      // Using executeRawUnsafe because table name is dynamic but strictly controlled by our code (enum-like switch above)
      const query = `
        UPDATE "${tableName}"
        SET addresses = COALESCE(addresses, '[]'::jsonb) || $1::jsonb
        WHERE "${idColumn}" = $2
      `;

      await baseClient.$executeRawUnsafe(query, addressJson, parentId);

      // Return the full object with IDs hydrated
      return {
        ...storedAddress,
        ...(modelName === "customer" ? { customerId: parentId } : { restaurantId: parentId })
      };
    },

    async update(
      parentId: string,
      addressId: string,
      data: Partial<Address>
    ): Promise<Address> {
      // Ensure we don't accidentally write parent IDs into the JSON if the user passed them
      const { customerId, restaurantId, ...cleanData } = data;
      const updateJson = JSON.stringify(cleanData);
      // Construct the SQL for updating the matching element in array
      const query = `
        UPDATE "${tableName}"
        SET addresses = (
          SELECT jsonb_agg(
              CASE 
                  WHEN elem->>'addressId' = $1 
                  THEN elem || $2::jsonb
                  ELSE elem 
              END
          )
          FROM jsonb_array_elements(addresses) AS elem
        )
        WHERE "${idColumn}" = $3
        AND addresses @> ('[{"addressId": "' || $1 || '"}]')::jsonb
      `;

      await baseClient.$executeRawUnsafe(query, addressId, updateJson, parentId);

      // Return the updated address (simulated, as we don't fetch it back from DB to save perf)
      // Ideally we would fetch it, but for now merging input
      // To be accurate, let's fetch it.
      const found = await this.findById(parentId, addressId);
      if (!found) throw NotFoundError("Address not found after update");
      return found;
    },

    async remove(parentId: string, addressId: string): Promise<void> {
      const query = `
        UPDATE "${tableName}"
        SET addresses = (
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(addresses) AS elem
          WHERE elem->>'addressId' != $1
        )
        WHERE "${idColumn}" = $2
        AND addresses @> ('[{"addressId": "' || $1 || '"}]')::jsonb
      `;
      await baseClient.$executeRawUnsafe(query, addressId, parentId);
    },

    async list(parentId: string): Promise<Address[]> {
      const query = `SELECT addresses FROM "${tableName}" WHERE "${idColumn}" = $1`;
      const result = await baseClient.$queryRawUnsafe<Array<{ addresses: any }>>(
        query,
        parentId
      );

      if (!result || result.length === 0 || !result[0] || !result[0].addresses) return [];

      const rawAddresses = result[0].addresses as any[];

      // Hydrate parent IDs back into the objects
      return rawAddresses.map(addr => ({
        ...addr,
        customerId: modelName === "customer" ? parentId : null,
        restaurantId: modelName === "restaurant" ? parentId : null,
      })) as Address[];
    },

    async findById(
      parentId: string,
      addressId: string
    ): Promise<Address | null> {
      const all = await this.list(parentId);
      return all.find((a) => a.addressId === addressId) || null;
    },

    async unsetPrimary(parentId: string, excludeAddressId?: string): Promise<void> {
      let excludeCondition = "FALSE";
      if (excludeAddressId) {
        excludeCondition = `(elem->>'addressId' = '${excludeAddressId}')`;
      }

      // We simply set isPrimary = false for everything that isn't the excluded ID
      const query = `
        UPDATE "${tableName}"
        SET addresses = (
            SELECT jsonb_agg(
            CASE 
                WHEN (NOT ${excludeCondition}) AND (elem->>'isPrimary')::boolean = true
                THEN jsonb_set(elem, '{isPrimary}', 'false')
                ELSE elem
            END
            )
            FROM jsonb_array_elements(addresses) AS elem
        )
        WHERE "${idColumn}" = $1
       `;

      await baseClient.$executeRawUnsafe(query, parentId);
    }
  };
};

export const prisma = baseClient.$extends({
  model: {
    customer: {
      address() {
        return createAddressMethods("customer");
      },
    },
    restaurant: {
      address() {
        return createAddressMethods("restaurant");
      },
    },
  },
});
