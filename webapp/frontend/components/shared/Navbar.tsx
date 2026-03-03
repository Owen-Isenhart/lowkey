import Link from "next/link";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import SignOutButton from "./SignOutButton";

const NAV_LINKS = [
  { href: "/changelog",     label: "Changelog" },
  { href: "/ingredients",   label: "Ingredients" },
  { href: "/store-locator", label: "Stores" },
  { href: "/events",        label: "Events" },
  { href: "/shop",          label: "Shop" },
  { href: "/scan",          label: "Scan" },
];

async function AuthSection() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/shop/sign-in"
        style={{
          fontSize: "0.8125rem",
          padding: "8px 16px",
          background: "var(--accent)",
          color: "#000",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Sign In
      </Link>
    );
  }

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      {session.user.isAdmin && (
        <Link
          href="/admin"
          style={{
            fontSize: "0.8125rem",
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Admin
        </Link>
      )}
      <SignOutButton />
    </div>
  );
}

function NavLinks() {
  return (
    <ul
      style={{
        display: "flex",
        gap: "32px",
        listStyle: "none",
      }}
    >
      {NAV_LINKS.map(({ href, label }) => (
        <li key={href}>
          <NavLink href={href}>{label}</NavLink>
        </li>
      ))}
    </ul>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: "0.8125rem",
        color: "var(--text-secondary)",
        transition: "color var(--duration-fast) var(--ease-out)",
        fontWeight: 400,
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

export default async function Navbar() {
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
            textDecoration: "none",
          }}
        >
          lowkey
        </Link>

        {/* Links */}
        <NavLinks />

        {/* Auth Section */}
        <Suspense fallback={<div style={{ width: "100px" }} />}>
          <AuthSection />
        </Suspense>
      </nav>
    </header>
  );
}
