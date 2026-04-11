import dotenv from "dotenv";
dotenv.config();
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import pg from "pg";
import { v7 as uuidv7 } from "uuid";
import { Address } from "../types/address.type.js";
import { RoleKey } from "../generated/prisma/enums.js";
import { NotFoundError } from "../utils/errors/error-factories.js";
import { TrackingStatusStep } from "../dto/orderTrackingStatus.dto.js";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({
  connectionString,
  max: 50, // Explicitly set pool limit (default is 10)
  connectionTimeoutMillis: 20000, // 20 seconds
  idleTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);

const baseClient = new PrismaClient({
  adapter,
  log: ["query", "error"],
});


const createRoleMethods = () => {
  return {
    async add(userId: string, role: RoleKey, tx?: any): Promise<void> {
      const client = tx || baseClient;

      const roleJson = JSON.stringify([role]);

      const query = `
        UPDATE "users"
        SET roles = CASE 
            WHEN roles @> $1::jsonb THEN roles 
            ELSE COALESCE(roles, '[]'::jsonb) || $1::jsonb 
        END
        WHERE "user_id" = $2
       `;

      await client.$executeRawUnsafe(query, roleJson, userId);
    },

    async remove(userId: string, role: RoleKey, tx?: any): Promise<void> {
      const client = tx || baseClient;
      // Postgres operator '-' removes element from JSONB array
      const query = `
        UPDATE "users"
        SET roles = roles - $1
        WHERE "user_id" = $2
       `;
      // Note: '-' with text expects the string value to remove
      await client.$executeRawUnsafe(query, role, userId);
    },

    async list(userId: string, tx?: any): Promise<RoleKey[]> {
      const client = tx || baseClient;
      const query = `SELECT roles FROM "users" WHERE "user_id" = $1`;
      const result = (await client.$queryRawUnsafe(
        query,
        userId
      )) as Array<{ roles: any }>;

      if (!result || result.length === 0 || !result[0] || !result[0].roles) return [];
      return result[0].roles as RoleKey[];
    },

    async has(userId: string, role: RoleKey, tx?: any): Promise<boolean> {
      const client = tx || baseClient;
      // Check if roles contains the specific role
      const roleJson = JSON.stringify([role]);
      const query = `
         SELECT 1 as exists 
         FROM "users" 
         WHERE "user_id" = $1 AND roles @> $2::jsonb
       `;
      const result = (await client.$queryRawUnsafe(
        query,
        userId,
        roleJson
      )) as any[];
      return result.length > 0;
    }
  };
};

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
      } as Address;
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
        RETURNING addresses
      `;

      const result = await baseClient.$queryRawUnsafe<Array<{ addresses: any }>>(
        query,
        addressId,
        updateJson,
        parentId
      );

      if (!result || result.length === 0) throw NotFoundError("Address not found or update failed");


      const updatedAddresses = result[0]!.addresses as any[];
      const updatedAddress = updatedAddresses.find((a) => a.addressId === addressId);

      if (!updatedAddress) throw NotFoundError("Address not found in updated list");

      return {
        ...updatedAddress,
        customerId: modelName === "customer" ? parentId : null,
        restaurantId: modelName === "restaurant" ? parentId : null,
      } as Address;
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

const createOrderTrackingMethods = () => {
  return {
    async append(
      orderId: string,
      customerId: string,
      stepData: Omit<TrackingStatusStep, "updatedAt">
    ): Promise<any> {
      const stepJson = JSON.stringify([{
        ...stepData,
        updatedAt: new Date()
      }]);

      const query = `
        UPDATE "order_tracking"
        SET 
          "tracking_status" = CASE
              WHEN jsonb_typeof("tracking_status") = 'array' 
                   AND jsonb_array_length("tracking_status") > 0 
                   AND ("tracking_status"->-1->>'orderStatusKey') = $3
              THEN "tracking_status"
              ELSE COALESCE("tracking_status", '[]'::jsonb) || $4::jsonb
          END,
          "updated_at" = CASE
              WHEN jsonb_typeof("tracking_status") = 'array' 
                   AND jsonb_array_length("tracking_status") > 0 
                   AND ("tracking_status"->-1->>'orderStatusKey') = $3
              THEN "updated_at"
              ELSE NOW()
          END
        WHERE "order_id" = $1 AND "customer_id" = $2
        RETURNING "order_tracking_id" as "orderTrackingId", "order_id" as "orderId", "customer_id" as "customerId", "tracking_status" as "trackingStatus", "created_at" as "createdAt", "updated_at" as "updatedAt"
      `;

      const result = await baseClient.$queryRawUnsafe<any[]>(
        query,
        orderId,
        customerId,
        stepData.orderStatusKey,
        stepJson
      );

      if (!result || result.length === 0) {
        throw NotFoundError("Order Tracking Status Not Found");
      }

      return result[0];
    }
  };
};

export const prisma = baseClient.$extends({
  model: {
    user: {
      role() {
        return createRoleMethods();
      },
    },
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
    orderTracking: {
      status() {
        return createOrderTrackingMethods();
      },
    },
  },
});

export type ExtendedPrismaClient = typeof prisma;

export type ExtendedTransactionClient = Omit<
  ExtendedPrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
