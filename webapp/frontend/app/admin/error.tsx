"use client";

import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "40px 48px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ maxWidth: "600px" }}>
        <p className="text-label" style={{ marginBottom: "8px", color: "#d46b6b" }}>Error</p>
        <h1 className="text-heading" style={{ marginBottom: "24px" }}>
          Something went wrong in the admin panel
        </h1>

        <p style={{
          fontSize: "1rem",
          color: "var(--text-secondary)",
          marginBottom: "32px",
          lineHeight: 1.6
        }}>
          We encountered an error while loading the admin panel. This might be due to:
        </p>

        <ul style={{
          listStyle: "none",
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          marginBottom: "40px",
          paddingLeft: "20px"
        }}>
          {[
            "Missing or invalid authentication token",
            "Backend API is unreachable",
            "Admin verification failed"
          ].map((item) => (
            <li key={item} style={{ marginBottom: "8px" }}>
              • {item}
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => reset()}
            className="btn-primary"
            style={{ fontSize: "0.8125rem" }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn-outline"
            style={{ fontSize: "0.8125rem", textDecoration: "none", display: "inline-block", padding: "12px 24px", borderRadius: "8px" }}
          >
            Back to Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error?.message && (
          <details style={{
            marginTop: "40px",
            padding: "16px",
            background: "var(--bg-elevated)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)"
          }}>
            <summary style={{ cursor: "pointer", fontWeight: 500, marginBottom: "8px" }}>
              Error Details (Development Only)
            </summary>
            <pre style={{ overflow: "auto", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
