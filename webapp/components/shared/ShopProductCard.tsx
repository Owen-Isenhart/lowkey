"use client";

import { useSession, signIn } from "next-auth/react";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ShopProductCard({ product }: Props) {
  const { data: session } = useSession();

  function handleAddToCart() {
    if (!session) {
      // Redirect to sign in, then return to shop
      signIn(undefined, { callbackUrl: "/shop" });
      return;
    }
    // TODO: implement cart addition action
    console.log("Add to cart:", product.id);
  }

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        transition: "border-color var(--duration-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
    >
      {/* Product image placeholder */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/3",
          background: "var(--bg-subtle)",
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-label">lowkey</span>
      </div>

      {/* Product info */}
      <div>
        <p className="text-label" style={{ marginBottom: "6px" }}>
          {product.type === "subscription" ? "Sprint" : "Single Can"}
        </p>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "4px" }}>
          {product.name}
        </h2>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {product.description}
        </p>
      </div>

      {/* Price + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span
          className="text-mono"
          style={{ fontSize: "1rem", color: "var(--text-primary)", fontWeight: 500 }}
        >
          {formatPrice(product.price_cents)}
        </span>
        <button
          onClick={handleAddToCart}
          style={{
            padding: "8px 18px",
            background: "var(--accent)",
            color: "#0c0c0e",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          {session ? "Add to cart" : "Sign in to buy"}
        </button>
      </div>
    </div>
  );
}
