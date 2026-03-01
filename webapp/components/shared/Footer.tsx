"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "auto",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <span className="text-label">lowkey © {new Date().getFullYear()}</span>

        <nav style={{ display: "flex", gap: "24px" }}>
          {[
            { href: "/changelog",     label: "Changelog" },
            { href: "/ingredients",   label: "Ingredients" },
            { href: "/store-locator", label: "Stores" },
            { href: "/events",        label: "Events" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                transition: "color var(--duration-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
