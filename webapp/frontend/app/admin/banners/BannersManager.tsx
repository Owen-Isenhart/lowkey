"use client";

import { useRef, useState } from "react";
import { createBanner, deleteBanner } from "@/app/admin/actions";
import type { Banner } from "@/types";

interface Props {
  banners: Banner[];
}

const BANNER_TYPES = ["info", "warning", "success", "error"] as const;

const BANNER_FIELDS = [
  { name: "title", label: "Banner Title *", type: "text", placeholder: "e.g. New flavor available!" },
  { name: "content", label: "Message *", type: "textarea", placeholder: "The banner content displayed to users…" },
  {
    name: "bannerType",
    label: "Type *",
    type: "select",
    options: BANNER_TYPES,
    placeholder: "Select banner type",
  },
  {
    name: "expiresAt",
    label: "Expires At (Optional)",
    type: "datetime-local",
    placeholder: "",
  },
];

export default function BannersManager({ banners: initialBanners }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [state, setState] = useState<{
    status: "idle" | "loading" | "ok" | "error";
    message?: string;
    errors?: Record<string, string>;
  }>({ status: "idle" });
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setState({ status: "loading" });
    const fd = new FormData(formRef.current);
    
    const result = await createBanner(fd);
    if ("success" in result) {
      // Use the actual banner data from server
      setBanners([...banners, result.banner]);
      setState({ status: "ok", message: "Banner created." });
      formRef.current.reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => setState({ status: "idle" }), 3000);
    } else {
      setState({ status: "error", message: result.error, errors: result.errors });
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const result = await deleteBanner(id);
    if ("success" in result) {
      setBanners(banners.filter(b => b.id !== id));
    }
    setDeleting(null);
  }

  const getBannerTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      info: "#4a9eff",
      warning: "#ffb946",
      success: "#5dba63",
      error: "#d46b6b",
    };
    return colors[type] || colors.info;
  };

  return (
    <div>
      {/* Existing banners */}
      <section style={{ marginBottom: "48px" }}>
        <p className="text-label" style={{ marginBottom: "16px" }}>
          All Banners ({banners.length})
        </p>
        {banners.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No banners yet.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {banners.map((banner) => (
              <li
                key={banner.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "14px 20px",
                  background: "var(--bg-elevated)",
                  border: `1px solid ${getBannerTypeColor(banner.banner_type)}44`,
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {banner.title}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        background: `${getBannerTypeColor(banner.banner_type)}20`,
                        color: getBannerTypeColor(banner.banner_type),
                        letterSpacing: "0.05em",
                      }}
                    >
                      {banner.banner_type}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    {banner.content}
                  </p>
                  <p className="text-label">
                    {banner.is_active ? "✓ Active" : "Inactive"} •{" "}
                    {banner.expires_at
                      ? `Expires ${new Date(banner.expires_at).toLocaleDateString()}`
                      : "No expiration"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(banner.id)}
                  disabled={deleting === banner.id}
                  style={{
                    background: "none",
                    border: "1px solid #d46b6b44",
                    borderRadius: "var(--radius-sm)",
                    color: "#d46b6b",
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    opacity: deleting === banner.id ? 0.5 : 1,
                    whiteSpace: "nowrap",
                    marginLeft: "12px",
                  }}
                >
                  {deleting === banner.id ? "Deleting…" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create form */}
      <section>
        <p className="text-label" style={{ marginBottom: "16px" }}>
          New Banner
        </p>
        <form
          ref={formRef}
          onSubmit={handleCreate}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            maxWidth: "680px",
          }}
        >
          {BANNER_FIELDS.map(({ name, label, type, placeholder, options }) => (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                gridColumn: type === "textarea" ? "1 / -1" : "auto",
              }}
            >
              <label
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  placeholder={placeholder}
                  rows={3}
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: `1px solid ${
                      state.errors?.[name] ? "#d46b6b88" : "var(--border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    resize: "vertical",
                    outline: "none",
                  }}
                />
              ) : type === "select" ? (
                <select
                  name={name}
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: `1px solid ${
                      state.errors?.[name] ? "#d46b6b88" : "var(--border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">{placeholder}</option>
                  {options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-elevated)",
                    border: `1px solid ${
                      state.errors?.[name] ? "#d46b6b88" : "var(--border)"
                    }`,
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              )}
              {state.errors?.[name] && (
                <p style={{ fontSize: "0.7rem", color: "#d46b6b" }}>
                  {state.errors[name]}
                </p>
              )}
            </div>
          ))}

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              type="submit"
              disabled={state.status === "loading"}
              className="btn-primary"
              style={{ opacity: state.status === "loading" ? 0.6 : 1 }}
            >
              {state.status === "loading" ? "Creating…" : "Create Banner"}
            </button>
            {state.status === "ok" && (
              <p style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                {state.message}
              </p>
            )}
            {state.status === "error" &&
              !Object.keys(state.errors ?? {}).length && (
                <p style={{ fontSize: "0.8rem", color: "#d46b6b" }}>
                  {state.message}
                </p>
              )}
          </div>
        </form>
      </section>
    </div>
  );
}
