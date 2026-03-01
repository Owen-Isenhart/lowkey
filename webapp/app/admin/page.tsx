import type { Metadata } from "next";
import Link from "next/link";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminPage() {
  const [eventCount, batchCount] = await Promise.all([
    query<{ count: string }>("SELECT COUNT(*) FROM events").then((r) => r[0]?.count ?? "0").catch(() => "–"),
    query<{ count: string }>("SELECT COUNT(*) FROM batches").then((r) => r[0]?.count ?? "0").catch(() => "–"),
  ]);

  const stats = [
    { label: "Events",  value: eventCount, href: "/admin/events" },
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

      <div style={{ display: "flex", gap: "12px" }}>
        <Link href="/admin/events"  className="btn-outline" style={{ fontSize: "0.8125rem" }}>Manage Events →</Link>
        <Link href="/admin/batches" className="btn-outline" style={{ fontSize: "0.8125rem" }}>Manage Batches →</Link>
      </div>
    </div>
  );
}
