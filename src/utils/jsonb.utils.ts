import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.config";

export class JsonbUtils {
    /**
     * Appends an item to a JSONB array column.
     * 
     * @param tableName - The name of the table (e.g., "customers")
     * @param idColumn - The name of the primary key column (e.g., "customer_id")
     * @param idValue - The value of the primary key
     * @param jsonColumn - The name of the JSONB column (e.g., "addresses")
     * @param newItem - The object to append
     */
    static async addItemToArray(
        tableName: string,
        idColumn: string,
        idValue: string,
        jsonColumn: string,
        newItem: object
    ) {
        // Note: Table and column names cannot be parameterized in potential SQL injection targets.
        // Ensure these are passed from trusted hardcoded strings in the code.
        const query = `
      UPDATE "${tableName}"
      SET "${jsonColumn}" = COALESCE("${jsonColumn}", '[]'::jsonb) || $1::jsonb
      WHERE "${idColumn}" = $2
    `;

        // We use executeRawUnsafe because table/column names are dynamic strings.
        // Usage MUST ensure tableName/columnName are safe constants.
        await prisma.$executeRawUnsafe(query, JSON.stringify(newItem), idValue);
    }

    /**
     * Updates an item in a JSONB array column based on a unique key within the item.
     * 
     * @param tableName - The name of the table
     * @param idColumn - The name of the primary key column
     * @param idValue - The value of the primary key
     * @param jsonColumn - The name of the JSONB column
     * @param itemKeyField - The field name in the JSON object to match (e.g., "addressId")
     * @param itemKeyValue - The value of the key to match
     * @param updateData - The data to merge/update
     */
    static async updateItemInArray(
        tableName: string,
        idColumn: string,
        idValue: string,
        jsonColumn: string,
        itemKeyField: string,
        itemKeyValue: string,
        updateData: object
    ) {
        // Complex update using a subquery to rebuild the array with the modified item
        const query = `
      UPDATE "${tableName}"
      SET "${jsonColumn}" = (
        SELECT jsonb_agg(
            CASE 
                WHEN elem->>'${itemKeyField}' = $1 
                THEN elem || $2::jsonb
                ELSE elem 
            END
        )
        FROM jsonb_array_elements("${jsonColumn}") AS elem
      )
      WHERE "${idColumn}" = $3
      AND "${jsonColumn}" @> ('[{"${itemKeyField}": "' || $1 || '"}]')::jsonb
    `;

        await prisma.$executeRawUnsafe(query, itemKeyValue, JSON.stringify(updateData), idValue);
    }

    /**
     * Removes an item from a JSONB array column.
     * 
     * @param tableName - The name of the table
     * @param idColumn - The name of the primary key column
     * @param idValue - The value of the primary key
     * @param jsonColumn - The name of the JSONB column
     * @param itemKeyField - The field name in the JSON object to match
     * @param itemKeyValue - The value of the key to match
     */
    static async removeItemFromArray(
        tableName: string,
        idColumn: string,
        idValue: string,
        jsonColumn: string,
        itemKeyField: string,
        itemKeyValue: string
    ) {
        const query = `
      UPDATE "${tableName}"
      SET "${jsonColumn}" = (
        SELECT jsonb_agg(elem)
        FROM jsonb_array_elements("${jsonColumn}") AS elem
        WHERE elem->>'${itemKeyField}' != $1
      )
      WHERE "${idColumn}" = $2
      AND "${jsonColumn}" @> ('[{"${itemKeyField}": "' || $1 || '"}]')::jsonb
    `;

        await prisma.$executeRawUnsafe(query, itemKeyValue, idValue);
    }

    /**
   * Sets a specific field to false for all items in the array, excluding one optional item.
   * Useful for "isPrimary" toggling.
   */
    static async updateAllItemsField(
        tableName: string,
        idColumn: string,
        idValue: string,
        jsonColumn: string,
        fieldToUpdate: string,
        newValue: any,
        excludeKeyField?: string,
        excludeKeyValue?: string,
        filterField?: string,
        filterValue?: any
    ) {
        let excludeCondition = "FALSE"; // Default: exclude nothing extra
        if (excludeKeyField && excludeKeyValue) {
            excludeCondition = `(elem->>'${excludeKeyField}' = '${excludeKeyValue}')`;
        }

        let filterCondition = "TRUE";
        if (filterField && filterValue !== undefined) {
            filterCondition = `(elem->>'${filterField}')::boolean = ${filterValue}`;
        }

        const query = `
      UPDATE "${tableName}"
      SET "${jsonColumn}" = (
        SELECT jsonb_agg(
          CASE 
            WHEN (NOT ${excludeCondition}) AND ${filterCondition}
            THEN jsonb_set(elem, '{${fieldToUpdate}}', '${newValue}')
            ELSE elem
          END
        )
        FROM jsonb_array_elements("${jsonColumn}") AS elem
      )
      WHERE "${idColumn}" = $1
    `;

        await prisma.$executeRawUnsafe(query, idValue);
    }
}
