"use client";

import { useCart } from "@/components/providers/CartProvider";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FlavorDisplay from "@/components/3d/FlavorDisplay";

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const { items, getTotal, isLoading, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = useMemo(() => getTotal(), [items, getTotal]);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/checkout" });
    }
  }, [status]);

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push("/shop");
    }
  }, [items, isLoading, router]);

  if (isLoading || status === "loading") {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return null; // Will redirect
  }

  const handleStripeCheckout = () => {
    setIsProcessing(true);
    // TODO: Integrate with Stripe in production
    // For now, show a placeholder message
    alert(
      "Stripe integration coming soon!\n\nOrder Summary:\n" +
      items.map((item) => `${item.product.name} × ${item.quantity}`).join("\n") +
      `\n\nTotal: ${formatPrice(total)}`
    );
    setIsProcessing(false);
  };

  const shippingCost = total >= 3000 ? 0 : 500; // Free shipping over $30
  const finalTotal = total + shippingCost;

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Checkout</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>
        Order Summary
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>
        Review your order and complete payment.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "48px",
          alignItems: "start",
        }}
      >
        {/* Order items */}
        <div>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "24px" }}>
            Order Items ({itemCount})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {items.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    background: "var(--bg-subtle)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  {item.product.obj_model_path ? (
                    <FlavorDisplay
                      modelPath={item.product.obj_model_path}
                      width={100}
                      height={100}
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

                {/* Info */}
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "4px" }}>
                    {item.product.name}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    Quantity: {item.quantity}
                  </p>
                </div>

                {/* Price */}
                <p
                  className="text-mono"
                  style={{ fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  {formatPrice(item.product.price_cents * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "32px",
            position: "sticky",
            top: "24px",
          }}
        >
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "24px" }}>
            Payment Summary
          </h2>

          {/* Order details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
              <span className="text-mono" style={{ fontWeight: 600 }}>
                {formatPrice(total)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
              <span className="text-mono" style={{ fontWeight: 600 }}>
                {shippingCost === 0 ? (
                  <span style={{ color: "var(--accent)" }}>FREE</span>
                ) : (
                  formatPrice(shippingCost)
                )}
              </span>
            </div>

            {shippingCost > 0 && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                Free shipping on orders over $30
              </p>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontWeight: 500 }}>Total</span>
              <span
                className="text-mono"
                style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}
              >
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          {/* Order info */}
          <div
            style={{
              padding: "16px",
              background: "var(--bg-subtle)",
              borderRadius: "var(--radius-md)",
              marginBottom: "24px",
              fontSize: "0.8125rem",
            }}
          >
            <p style={{ marginBottom: "8px", fontWeight: 500 }}>Order Details</p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "4px" }}>
              <strong>Email:</strong> {session?.user?.email}
            </p>
            <p style={{ color: "var(--text-secondary)" }}>
              <strong>Items:</strong> {itemCount} can{itemCount !== 1 ? "s" : ""}
            </p>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={handleStripeCheckout}
              disabled={isProcessing}
              style={{
                padding: "14px",
                background: isProcessing ? "var(--border)" : "var(--accent)",
                color: "#0c0c0e",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: isProcessing ? "default" : "pointer",
                opacity: isProcessing ? 0.6 : 1,
                transition: "opacity var(--duration-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => !isProcessing && ((e.currentTarget as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => !isProcessing && ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >
              {isProcessing ? "Processing..." : "Continue to Payment"}
            </button>
            <button
              onClick={() => router.push("/cart")}
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
              Back to Cart
            </button>
          </div>

          {/* Security info */}
          <p
            style={{
              marginTop: "16px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            🔒 Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
