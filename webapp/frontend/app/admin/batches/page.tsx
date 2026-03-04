import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BatchManager from "./BatchManager";
import type { Batch } from "@/types";

export const metadata: Metadata = { title: "Admin — Batches" };

export default async function AdminBatchesPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const token = (session as any)?.backendToken;
  if (!token) {
    return (
      <div>
        <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
        <h1 className="text-heading" style={{ marginBottom: "40px" }}>Batches</h1>
        <p style={{ color: "var(--text-muted)" }}>Unable to load batches. Please try signing out and back in.</p>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const batches = await fetch(`${apiUrl}/batches`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
    .then((res) => res.ok ? res.json() : [])
    .catch(() => [] as Batch[]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div>
      <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>Batches</h1>
      <BatchManager batches={batches} appUrl={appUrl} />
    </div>
  );
}
