import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  // Additional defense-in-depth: verify admin status locally
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // Fetch stats from the API — use session's backendToken if available
  const token = (session as any)?.backendToken;
  if (!token) {
    // Gracefully handle missing token — show empty stats
    return (
      <div>
        <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
        <h1 className="text-heading" style={{ marginBottom: "40px" }}>Dashboard</h1>
        <p style={{ color: "var(--text-muted)" }}>Unable to load dashboard. Please try signing out and back in.</p>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const headers = { Authorization: `Bearer ${token}` };

  const [eventCount, bannerCount, batchCount] = await Promise.all([
    fetch(`${apiUrl}/events`, { headers, cache: "no-store" })
        .then((res) => res.ok ? res.json() : [])
        .then((data) => String(data.length))
        .catch(() => "–"),
    fetch(`${apiUrl}/banners`, { headers, cache: "no-store" })
        .then((res) => res.ok ? res.json() : [])
        .then((data) => String(data.length))
        .catch(() => "–"),
    fetch(`${apiUrl}/batches`, { headers, cache: "no-store" })
        .then((res) => res.ok ? res.json() : [])
        .then((data) => String(data.length))
        .catch(() => "–"),
  ]);

  const stats = [
    { label: "Events",  value: eventCount, href: "/admin/events" },
    { label: "Banners", value: bannerCount,  href: "/admin/banners" },
    { label: "Batches", value: batchCount,  href: "/admin/batches" },
  ];

  return (
    <div>
      <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>Dashboard</h1>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "48px" }}>
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="card-hover"
            style={{
              display: "block",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px 32px",
              textDecoration: "none",
              minWidth: "160px",
            }}
          >
            <p className="text-mono" style={{ fontSize: "2rem", color: "var(--accent)", lineHeight: 1 }}>
              {value}
            </p>
            <p className="text-label" style={{ marginTop: "8px" }}>{label}</p>
          </Link>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link href="/admin/events"  className="btn-outline" style={{ fontSize: "0.8125rem" }}>Manage Events →</Link>
        <Link href="/admin/banners" className="btn-outline" style={{ fontSize: "0.8125rem" }}>Manage Banners →</Link>
        <Link href="/admin/batches" className="btn-outline" style={{ fontSize: "0.8125rem" }}>Manage Batches →</Link>
      </div>
    </div>
  );
}
