"use client";

import { useState } from "react";
import type { RecipeHistoryEntry, Recipe } from "@/types";

interface ChangelogEntryProps {
  entry: RecipeHistoryEntry;
  recipe: Recipe;
}

export default function ChangelogEntry({ entry, recipe }: ChangelogEntryProps) {
  const [open, setOpen] = useState(false);

  return (
    <li style={{ display: "flex", gap: "24px", paddingBottom: "40px", position: "relative" }}>
      {/* Dot */}
      <div
        style={{
          flexShrink: 0,
          width: "15px",
          height: "15px",
          borderRadius: "50%",
          background: entry.isStable ? "var(--accent)" : "var(--border)",
          border: `2px solid ${entry.isStable ? "var(--accent)" : "var(--border-hover)"}`,
          marginTop: "3px",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1 }}>
        {/* Header row */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          <span
            className="text-mono"
            style={{
              color: entry.isStable ? "var(--accent)" : "var(--text-primary)",
              fontWeight: 500,
            }}
          >
            {entry.version}
          </span>
          {entry.isStable && (
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#0c0c0e",
                background: "var(--accent)",
                padding: "2px 7px",
                borderRadius: "99px",
              }}
            >
              stable
            </span>
          )}
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              marginLeft: "4px",
              transition: "transform 200ms",
              transform: open ? "rotate(90deg)" : "rotate(0deg)",
              display: "inline-block",
            }}
          >
            ›
          </span>
        </button>

        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
          {entry.name}
        </p>
        <p className="text-label">{entry.dateLabel}</p>

        {/* Expanded ingredient breakdown */}
        {open && (
          <div
            style={{
              marginTop: "16px",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Ingredient", "Amount", "Cost/oz"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-muted)",
                        background: "var(--bg-elevated)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((ing, i) => {
                  const costPerUnit = ing.cost_per_bulk / ing.bulk_amount;
                  const totalCost = costPerUnit * ing.amount;
                  return (
                    <tr
                      key={ing.name}
                      style={{
                        borderBottom: i < recipe.ingredients.length - 1 ? "1px solid var(--border)" : "none",
                        background: i % 2 === 0 ? "var(--bg)" : "var(--bg-elevated)",
                      }}
                    >
                      <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: "var(--text-primary)" }}>
                        {ing.name}
                      </td>
                      <td className="text-mono" style={{ padding: "10px 16px", fontSize: "0.8rem", color: "var(--accent)" }}>
                        {ing.amount} {ing.unit}
                      </td>
                      <td className="text-mono" style={{ padding: "10px 16px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        ${totalCost.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{
              padding: "10px 16px",
              background: "var(--bg-elevated)",
              borderTop: "1px solid var(--border)",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
            }}>
              Total volume: {recipe.total_volume_oz} oz
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
