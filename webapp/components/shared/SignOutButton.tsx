"use client";

import { signOutAction } from "@/app/actions/auth";

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        style={{
          fontSize: "0.8125rem",
          background: "transparent",
          border: "1px solid var(--border)",
          color: "var(--text-secondary)",
          borderRadius: "var(--radius-md)",
          padding: "8px 16px",
          cursor: "pointer",
          fontWeight: 500,
          transition: "all var(--duration-fast) var(--ease-out)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
      >
        Sign Out
      </button>
    </form>
  );
}
