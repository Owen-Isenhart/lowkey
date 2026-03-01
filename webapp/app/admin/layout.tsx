import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_NAV = [
  { href: "/admin",         label: "Dashboard" },
  { href: "/admin/events",  label: "Events" },
  { href: "/admin/batches", label: "Batches" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard — middleware already blocked non-admins at the edge,
  // but we double-check here for defense-in-depth.
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <nav style={{
        width: "200px",
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: "40px 0",
        background: "var(--bg-elevated)",
      }}>
        <div style={{ padding: "0 24px 32px" }}>
          <p className="text-label" style={{ marginBottom: "4px" }}>Admin</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {session.user.email}
          </p>
        </div>

        <ul style={{ listStyle: "none" }}>
          {ADMIN_NAV.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="link-hover"
                style={{
                  display: "block",
                  padding: "10px 24px",
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main */}
      <div style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
