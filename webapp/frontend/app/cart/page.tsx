"use client";

import { useCart } from "@/components/providers/CartProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import FlavorDisplay from "@/components/3d/FlavorDisplay";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

interface CartLineItem {
  productId: number;
  name: string;
  flavor: string;
  price_cents: number;
  quantity: number;
  objModelPath?: string;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, isLoading } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const total = useMemo(() => getTotal(), [items, getTotal]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
        <p className="text-label" style={{ marginBottom: "16px" }}>Cart</p>
        <h1 className="text-heading" style={{ marginBottom: "40px" }}>
          Your cart is empty.
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
          Explore our flavors and add some Lowkey to your day.
        </p>
        <Link
          href="/shop"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "var(--accent)",
            color: "#0c0c0e",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "opacity var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Cart</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>
        Review your order.
      </h1>

      {/* Cart items */}
      <div
        style={{
          marginBottom: "48px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.product.id}
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr auto",
              gap: "24px",
              alignItems: "center",
              padding: "24px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            {/* Product image with 3D model */}
            <div
              style={{
                width: "120px",
                height: "120px",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
              }}
            >
              {item.product.obj_model_path ? (
                <FlavorDisplay
                  modelPath={item.product.obj_model_path}
                  width={120}
                  height={120}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  lowkey
                </div>
              )}
            </div>

            {/* Product info and quantity controls */}
            <div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "8px" }}>
                {item.product.name}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                {item.product.description}
              </p>

              {/* Quantity controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    padding: "6px 10px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: item.quantity <= 1 ? "default" : "pointer",
                    opacity: item.quantity <= 1 ? 0.5 : 1,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                  }
                  style={{
                    width: "40px",
                    padding: "6px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "center",
                    fontSize: "0.8125rem",
                  }}
                />
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= 99}
                  style={{
                    padding: "6px 10px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    cursor: item.quantity >= 99 ? "default" : "pointer",
                    opacity: item.quantity >= 99 ? 0.5 : 1,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price and remove button */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "12px",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  {item.quantity} ×{" "}
                  <span style={{ fontWeight: 600 }}>
                    {formatPrice(item.product.price_cents)}
                  </span>
                </p>
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginTop: "4px",
                  }}
                  className="text-mono"
                >
                  {formatPrice(item.product.price_cents * item.quantity)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.product.id)}
                style={{
                  padding: "6px 12px",
                  background: "transparent",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "border-color var(--duration-fast) var(--ease-out)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order summary and checkout */}
      <div
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          maxWidth: "400px",
          marginLeft: "auto",
        }}
      >
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "24px" }}>
          Order Summary
        </h2>

        {/* Subtotal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border)",
            marginBottom: "16px",
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
          <span className="text-mono" style={{ fontWeight: 600 }}>
            {formatPrice(total)}
          </span>
        </div>

        {/* Shipping info */}
        <div
          style={{
            padding: "16px",
            background: "var(--bg-subtle)",
            borderRadius: "var(--radius-md)",
            marginBottom: "24px",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
          }}
        >
          <p style={{ marginBottom: "4px" }}>✓ Free shipping on orders $30+</p>
          <p>Final total calculated at checkout</p>
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "32px",
          }}
        >
          <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>Total</span>
          <span
            className="text-mono"
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}
          >
            {formatPrice(total)}
          </span>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => router.push("/checkout")}
            style={{
              padding: "14px",
              background: "var(--accent)",
              color: "#0c0c0e",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity var(--duration-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            Proceed to Checkout
          </button>
          <button
            onClick={() => router.push("/shop")}
            style={{
              padding: "14px",
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "border-color var(--duration-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-hover)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
          >
            Continue Shopping
          </button>
        </div>

        {/* Clear cart button */}
        <button
          onClick={clearCart}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "8px",
            background: "transparent",
            color: "var(--text-muted)",
            border: "none",
            fontSize: "0.75rem",
            cursor: "pointer",
            textDecoration: "underline",
            transition: "color var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-secondary)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-muted)")}
        >
          Clear cart
        </button>
      </div>
    </div>
  );
}
