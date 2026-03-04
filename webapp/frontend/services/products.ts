import type { Product } from "@/types";

export async function getProducts(): Promise<Product[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    try {
        const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error("Failed to fetch products", e);
        return [];
    }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    try {
        const res = await fetch(`${apiUrl}/products/${slug}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Failed to fetch product", e);
        return null;
    }
}
