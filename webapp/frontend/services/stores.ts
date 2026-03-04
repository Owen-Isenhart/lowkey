import type { StoreLocation } from "@/types";

export async function getAllStores(): Promise<StoreLocation[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    try {
        const res = await fetch(`${apiUrl}/stores`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return res.json();
    } catch (e) {
        console.error("Failed to fetch stores", e);
        return [];
    }
}
