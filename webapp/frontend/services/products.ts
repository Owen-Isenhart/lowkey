import type { Product } from "@/types";
import { query, queryOne } from "@/lib/db";

export async function getProducts(): Promise<Product[]> {
    return query<Product>(
        `SELECT id, slug, name, description, price_cents, image_url, type, active
     FROM products
     WHERE active = true
     ORDER BY type ASC, id ASC`
    );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    return queryOne<Product>(
        `SELECT id, slug, name, description, price_cents, image_url, type, active
     FROM products WHERE slug = $1 AND active = true`,
        [slug]
    );
}
