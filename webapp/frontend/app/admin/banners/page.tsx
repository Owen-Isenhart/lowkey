import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BannersManager from "./BannersManager";
import type { Banner } from "@/types";

export const metadata: Metadata = { title: "Admin — Banners" };

export default async function AdminBannersPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const token = (session as any)?.backendToken;
  if (!token) {
    return (
      <div>
        <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
        <h1 className="text-heading" style={{ marginBottom: "40px" }}>Banners</h1>
        <p style={{ color: "var(--text-muted)" }}>Unable to load banners. Please try signing out and back in.</p>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const banners = await fetch(`${apiUrl}/banners`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
    .then((res) => res.ok ? res.json() : [])
    .catch(() => [] as Banner[]);

  return (
    <div>
      <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>Banners</h1>
      <BannersManager banners={banners} />
    </div>
  );
}
