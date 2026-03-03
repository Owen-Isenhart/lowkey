import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBatchById } from "@/services/batches";
import BatchQRCode from "@/components/shared/BatchQRCode";

export const metadata: Metadata = { title: "Batch Dashboard" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BatchPage({ params }: Props) {
  const { id } = await params;
  const batch = await getBatchById(id).catch(() => null);

  if (!batch) notFound();

  const mixDate = new Date(batch!.mixed_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Digital Twin</p>
      <h1 className="text-heading" style={{ marginBottom: "4px" }}>Batch #{id}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "48px" }}>
        Formula{" "}
        <span className="text-mono" style={{ color: "var(--accent)" }}>{batch!.recipe_version}</span>
      </p>

      {/* Two-column layout: stats + QR code */}
      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginBottom: "40px" }}>
        {/* Stats */}
        <div style={{ flex: 1, minWidth: "240px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}>
            {[
              { label: "Mixed on", value: mixDate },
              { label: "pH Level", value: batch!.ph_level.toFixed(2) },
              { label: "Batch ID",  value: `#${batch!.id}` },
              { label: "Version",  value: batch!.recipe_version },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "var(--bg-elevated)", padding: "20px 24px" }}>
                <p className="text-label" style={{ marginBottom: "6px" }}>{label}</p>
                <p className="text-mono" style={{ color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code */}
        <BatchQRCode batchId={id} appUrl={appUrl} />
      </div>

      {batch!.notes && (
        <div style={{ marginBottom: "40px" }}>
          <p className="text-label" style={{ marginBottom: "10px" }}>Notes</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.7 }}>
            {batch!.notes}
          </p>
        </div>
      )}

      {batch!.ingredient_sources?.length > 0 && (
        <div>
          <p className="text-label" style={{ marginBottom: "16px" }}>Ingredient Sourcing</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {batch!.ingredient_sources.map((src) => (
              <li key={src.lot_number} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8125rem",
              }}>
                <span style={{ color: "var(--text-primary)" }}>{src.ingredient_name}</span>
                <span style={{ color: "var(--text-muted)" }}>
                  {src.supplier} · <span className="text-mono">{src.lot_number}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
