import type { Metadata } from "next";
import { query } from "@/lib/db";
import BatchManager from "./BatchManager";
import type { Batch } from "@/types";

export const metadata: Metadata = { title: "Admin — Batches" };

export default async function AdminBatchesPage() {
  const batches = await query<Batch>(
    "SELECT * FROM batches ORDER BY mixed_at DESC"
  ).catch(() => [] as Batch[]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>Batches</h1>
      <BatchManager batches={batches} appUrl={appUrl} />
    </div>
  );
}
