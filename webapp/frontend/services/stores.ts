import type { StoreLocation } from "@/types";
import { query } from "@/lib/db";

export async function getAllStores(): Promise<StoreLocation[]> {
    return query<StoreLocation>(
        `SELECT id, name, address, city, state, lat, lng, type
     FROM store_locations
     ORDER BY name ASC`
    );
}
