"use client";

import { useRef, useState } from "react";
import BatchQRCode from "@/components/shared/BatchQRCode";
import { createBatch, deleteBatch } from "@/app/admin/actions";
import type { Batch } from "@/types";

interface Props { batches: Batch[]; appUrl: string }

const BATCH_FIELDS = [
  { name: "id",             label: "Batch ID *",        type: "text",   placeholder: "LK-001" },
  { name: "recipe_version", label: "Recipe Version *",  type: "text",   placeholder: "1.2.0" },
  { name: "mixed_at",       label: "Mix Date & Time *", type: "datetime-local", placeholder: "" },
  { name: "ph_level",       label: "pH Level",           type: "number", placeholder: "6.2" },
  { name: "notes",          label: "Notes",              type: "textarea", placeholder: "Any relevant production notes…" },
];

export default function BatchManager({ batches, appUrl }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<{
    status: "idle" | "loading" | "ok" | "error";
    message?: string;
    errors?: Record<string, string>;
    newBatchId?: string;
  }>({ status: "idle" });
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setState({ status: "loading" });
    const fd = new FormData(formRef.current);
    const result = await createBatch(fd);
    if ("success" in result) {
      setState({ status: "ok", message: "Batch created.", newBatchId: result.batchId });
      formRef.current.reset();
    } else {
      setState({ status: "error", message: result.error, errors: result.errors });
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteBatch(id);
    setDeleting(null);
    setState({ status: "idle" });
  }

  return (
    <div>
      {/* Existing batches */}
      <section style={{ marginBottom: "48px" }}>
        <p className="text-label" style={{ marginBottom: "16px" }}>All Batches ({batches.length})</p>
        {batches.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No batches yet.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {batches.map((b) => (
              <li key={b.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}>
                <div>
                  <p className="text-mono" style={{ color: "var(--accent)", fontSize: "0.875rem", marginBottom: "2px" }}>
                    #{b.id}
                  </p>
                  <p className="text-label">
                    {b.recipe_version} · pH {b.ph_level?.toFixed(2) ?? "–"} · {new Date(b.mixed_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a href={`/batch/${b.id}`} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                      fontSize: "0.75rem", color: "var(--text-secondary)", textDecoration: "none" }}>
                    View
                  </a>
                  <button onClick={() => handleDelete(b.id)} disabled={deleting === b.id}
                    style={{ background: "none", border: "1px solid #d46b6b44", borderRadius: "var(--radius-sm)",
                      color: "#d46b6b", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer",
                      opacity: deleting === b.id ? 0.5 : 1 }}>
                    {deleting === b.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create form */}
      <section>
        <p className="text-label" style={{ marginBottom: "16px" }}>New Batch</p>
        <form ref={formRef} onSubmit={handleCreate}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "680px" }}>
          {BATCH_FIELDS.map(({ name, label, type, placeholder }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "6px",
              gridColumn: type === "textarea" ? "1 / -1" : "auto" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {label}
              </label>
              {type === "textarea" ? (
                <textarea name={name} placeholder={placeholder} rows={3}
                  style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: `1px solid ${state.errors?.[name] ? "#d46b6b88" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.875rem",
                    fontFamily: "inherit", resize: "vertical", outline: "none" }} />
              ) : (
                <input type={type} name={name} placeholder={placeholder}
                  step={type === "number" ? "0.01" : undefined}
                  style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: `1px solid ${state.errors?.[name] ? "#d46b6b88" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.875rem",
                    fontFamily: name === "id" || name === "recipe_version" ? "var(--font-mono)" : "inherit",
                    outline: "none" }} />
              )}
              {state.errors?.[name] && (
                <p style={{ fontSize: "0.7rem", color: "#d46b6b" }}>{state.errors[name]}</p>
              )}
            </div>
          ))}

          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "16px" }}>
            <button type="submit" disabled={state.status === "loading"} className="btn-primary"
              style={{ opacity: state.status === "loading" ? 0.6 : 1 }}>
              {state.status === "loading" ? "Creating…" : "Create Batch"}
            </button>
            {state.status === "error" && !Object.keys(state.errors ?? {}).length && (
              <p style={{ fontSize: "0.8rem", color: "#d46b6b" }}>{state.message}</p>
            )}
          </div>
        </form>

        {/* QR code for newly created batch */}
        {state.status === "ok" && state.newBatchId && (
          <div style={{ marginTop: "32px", padding: "24px", background: "var(--bg-elevated)",
            border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "inline-block" }}>
            <p style={{ fontSize: "0.875rem", color: "var(--accent)", marginBottom: "20px", fontWeight: 500 }}>
              ✓ Batch {state.newBatchId} created — print this QR code for the label.
            </p>
            <BatchQRCode batchId={state.newBatchId} appUrl={appUrl} />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "12px" }}>
              Right-click the QR code to save or print it.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
