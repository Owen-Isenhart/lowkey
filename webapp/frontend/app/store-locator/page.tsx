import type { Metadata } from "next";
import { getAllStores } from "@/services/stores";
import type { StoreLocation } from "@/types";

export const metadata: Metadata = {
  title: "Store Locator",
  description: "Find Lowkey at retail partners and campus stockists near you.",
};

const TYPE_LABEL: Record<StoreLocation["type"], string> = {
  retail: "Retail",
  campus: "Campus",
  online: "Online",
};

export default async function StoreLocatorPage() {
  const stores = await getAllStores().catch(() => [] as StoreLocation[]);

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Store Locator</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>Find Lowkey.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "48px" }}>
        Retail partners, campus stockists, and online availability.
      </p>

      {stores.length === 0 ? (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Store data coming soon. Check back after launch.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "16px",
        }}>
          {stores.map((store) => (
            <div
              key={store.id}
              className="card-hover"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "22px",
              }}
            >
              <p className="text-label" style={{ marginBottom: "8px" }}>
                {TYPE_LABEL[store.type]}
              </p>
              <h2 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "4px" }}>
                {store.name}
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                {store.address}
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                {store.city}, {store.state}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
