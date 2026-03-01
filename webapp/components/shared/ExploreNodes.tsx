"use client";

import Link from "next/link";
import { useState } from "react";

const NODES = [
  { id: "changelog",     label: "Changelog",    href: "/changelog",     desc: "Formula history" },
  { id: "ingredients",   label: "Ingredients",  href: "/ingredients",   desc: "What's inside" },
  { id: "stores",        label: "Stores",        href: "/store-locator", desc: "Find us near you" },
  { id: "events",        label: "Events",        href: "/events",        desc: "Pop-ups & campus" },
  { id: "shop",          label: "Shop",          href: "/shop",          desc: "Cans & Sprints" },
  { id: "scan",          label: "Scan",          href: "/scan",          desc: "Scan your bottle" },
];

const R = 6; // node dot radius

export default function ExploreNodes() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section>
      <p className="text-label" style={{ marginBottom: "28px" }}>Explore</p>

      {/* One row of nodes with labels below */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
        }}
      >
        {NODES.map((node, i) => {
          const isHovered = hovered === node.id;
          const isLast = i === NODES.length - 1;

          return (
            <div key={node.id} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
              {/* Node + label */}
              <Link
                href={node.href}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, textDecoration: "none", gap: "10px" }}
              >
                {/* Dot */}
                <div style={{ display: "flex", alignItems: "center", width: "100%", height: `${R * 2 + 2}px` }}>
                  {/* Left line */}
                  <div style={{
                    flex: 1,
                    height: "1px",
                    background: isHovered ? "var(--accent-dim)" : "var(--border)",
                    transition: "background 200ms",
                    visibility: i === 0 ? "hidden" : "visible",
                  }} />

                  {/* Circle */}
                  <div style={{
                    width: `${R * 2 + (isHovered ? 4 : 0)}px`,
                    height: `${R * 2 + (isHovered ? 4 : 0)}px`,
                    borderRadius: "50%",
                    background: isHovered ? "var(--accent)" : "var(--border-hover)",
                    flexShrink: 0,
                    transition: "width 180ms var(--ease-out), height 180ms var(--ease-out), background 180ms",
                    boxShadow: isHovered ? "0 0 10px var(--accent-glow)" : "none",
                  }} />

                  {/* Right line */}
                  <div style={{
                    flex: 1,
                    height: "1px",
                    background: isHovered ? "var(--accent-dim)" : "var(--border)",
                    transition: "background 200ms",
                    visibility: isLast ? "hidden" : "visible",
                  }} />
                </div>

                {/* Text below node */}
                <div style={{ textAlign: "center" }}>
                  <p style={{
                    fontSize: "0.75rem",
                    fontWeight: isHovered ? 500 : 400,
                    color: isHovered ? "var(--accent)" : "var(--text-secondary)",
                    transition: "color 180ms",
                    whiteSpace: "nowrap",
                  }}>
                    {node.label}
                  </p>
                  <p style={{
                    fontSize: "0.6875rem",
                    color: "var(--text-muted)",
                    marginTop: "3px",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 180ms",
                    whiteSpace: "nowrap",
                  }}>
                    {node.desc}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
