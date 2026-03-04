"use client";

import Link from "next/link";
import { useCart } from "@/components/providers/CartProvider";

/**
 * Cart badge that shows item count in navbar.
 * Client component to display real-time cart updates.
 */
export function CartBadge() {
  const { items, isLoading, getItemCount } = useCart();
  const itemCount = getItemCount();

  // Don't show badge while loading
  if (isLoading) {
    return (
      <Link
        href="/cart"
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          textDecoration: "none",
          fontWeight: 400,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        Cart
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      style={{
        fontSize: "0.8125rem",
        color: "var(--text-secondary)",
        textDecoration: "none",
        fontWeight: 400,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      Cart
      {itemCount > 0 && (
        <span
          style={{
            minWidth: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--accent)",
            color: "#0c0c0e",
            borderRadius: "999px",
            fontSize: "0.6875rem",
            fontWeight: 700,
            padding: "0 4px",
          }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
