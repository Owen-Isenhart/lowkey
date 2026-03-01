import type { Metadata } from "next";
import { getProducts } from "@/services/products";
import type { Product } from "@/types";
import ShopProductCard from "@/components/shared/ShopProductCard";

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
            <section style={{ marginBottom: "56px" }}>
              <p className="text-label" style={{ marginBottom: "20px" }}>Single Cans</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "16px",
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
              <p className="text-label" style={{ marginBottom: "20px" }}>Sprints — Subscribe</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "16px",
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
    </div>
  );
}
