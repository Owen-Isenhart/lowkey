import type { Batch } from "@/types";
import { queryOne } from "@/lib/db";

export async function getBatchById(id: string): Promise<Batch | null> {
    return queryOne<Batch>(
        `SELECT
       b.id,
       b.recipe_version,
       b.mixed_at,
       b.ph_level,
       b.notes,
       json_agg(json_build_object(
         'ingredient_name', src.ingredient_name,
         'supplier',        src.supplier,
         'lot_number',      src.lot_number
       )) AS ingredient_sources
     FROM batches b
     LEFT JOIN batch_ingredient_sources src ON src.batch_id = b.id
     WHERE b.id = $1
     GROUP BY b.id`,
        [id]
    );
}
