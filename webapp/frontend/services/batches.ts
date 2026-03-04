import type { Batch } from "@/types";

export async function getBatchById(id: string): Promise<Batch | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  try {
    const res = await fetch(`${apiUrl}/batches/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Failed to fetch batch", e);
    return null;
  }
}
