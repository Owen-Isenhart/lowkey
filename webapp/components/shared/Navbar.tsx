"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/changelog",     label: "Changelog" },
  { href: "/ingredients",   label: "Ingredients" },
  { href: "/store-locator", label: "Stores" },
  { href: "/events",        label: "Events" },
  { href: "/shop",          label: "Shop" },
  { href: "/scan",          label: "Scan" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(12,12,14,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <nav
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
          }}
        >
          lowkey
        </Link>

        {/* Links */}
        <ul
          style={{
            display: "flex",
            gap: "32px",
            listStyle: "none",
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname?.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    fontSize: "0.8125rem",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    transition: "color var(--duration-fast) var(--ease-out)",
                    fontWeight: active ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
