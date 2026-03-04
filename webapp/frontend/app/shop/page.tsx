import type { Metadata } from "next";
import { getProducts } from "@/services/products";
import type { Product } from "@/types";
import ShopProductCard from "@/components/shared/ShopProductCard";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const metadata: Metadata = {
  title: "Shop",
  description: "Get a Lowkey. Single cans or subscription Sprints.",
};

export default async function ShopPage() {
  const products = await getProducts().catch(() => [] as Product[]);

  const singles = products.filter((p) => p.type === "single");
  const subscriptions = products.filter((p) => p.type === "subscription");

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Shop</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>
        Get Lowkey.
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "56px" }}>
        Individual cans or subscription Sprints. Free shipping over $30.
      </p>

      {products.length === 0 ? (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Shop products launching soon. Stay tuned.
          </p>
        </div>
      ) : (
        <>
          {singles.length > 0 && (
            <section style={{ marginBottom: "64px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <p className="text-label">Single Cans</p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                {singles.map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {subscriptions.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <p className="text-label">Sprints — Subscribe & Save</p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                {subscriptions.map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Cart prompt */}
      {products.length > 0 && (
        <div
          style={{
            marginTop: "64px",
            padding: "32px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>
            Ready to checkout?
          </p>
          <Link
            href="/cart"
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
          >
            View Cart
          </Link>
        </div>
      )}
    </div>
  );
}
