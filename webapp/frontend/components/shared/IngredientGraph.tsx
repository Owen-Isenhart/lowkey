"use client";

import { useEffect, useRef, useState } from "react";
import type { Recipe, Ingredient } from "@/types";

/* ─── Metadata ───────────────────────────────────────────────────────────────── */
export const INGREDIENT_META: Record<
  string,
  { category: string; description: string; study_url?: string }
> = {
  "L-Theanine": {
    category: "Nootropic",
    description: "Promotes calm, focused attention without sedation.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/18681988/",
  },
  "L-Citrulline": {
    category: "Nootropic",
    description: "Promotes healthy blood flow and vasodilation for enhanced cognitive performance.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/example5",
  },
  "Sparkling Water": {
    category: "Base",
    description: "The clean, crisp carbonated base. Zero calories.",
  },
  "Natural Lime Extract": {
    category: "Flavour",
    description: "Freshly pressed key lime extract for authentic citrus brightness.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/example2",
  },
  "Natural Lemon Flavor": {
    category: "Flavour",
    description: "Light natural lemon extract for brightness without sweetener load.",
  },
  "Madagascar Vanilla Extract": {
    category: "Flavour",
    description: "Real vanilla bean extract for smooth, creamy undertones.",
  },
  "Mango Flavor Extract": {
    category: "Flavour",
    description: "Premium mango extract from ripened tropical fruit.",
  },
  "Passion Fruit Extract": {
    category: "Flavour",
    description: "Tart, exotic passion fruit for complex citrus notes.",
  },
  "Sodium Chloride": {
    category: "Electrolyte",
    description: "Essential electrolyte for hydration and cellular function.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/example3",
  },
  "Potassium Chloride": {
    category: "Electrolyte",
    description: "Balances sodium for optimal electrolyte ratio.",
  },
  "Magnesium Glycinate": {
    category: "Electrolyte",
    description: "Highly bioavailable magnesium for muscle relaxation and cognitive function.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/example6",
  },
  "Erythritol": {
    category: "Sweetener",
    description: "Zero-calorie sweetener with no glycemic impact.",
  },
  "Stevia Extract": {
    category: "Sweetener",
    description: "Natural plant-based sweetener with zero calories.",
  },
  "Sucralose": {
    category: "Sweetener",
    description: "High-intensity sweetener for zero-calorie formulations.",
  },
  "Vitamin C": {
    category: "Vitamin",
    description: "Powerful antioxidant supporting immune function and collagen synthesis.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/example4",
  },
  "Vitamin B-Complex": {
    category: "Vitamin",
    description: "Energy production and nervous system support.",
    study_url: "https://pubmed.ncbi.nlm.nih.gov/example7",
  },
};

export const CATEGORY_COLORS: Record<string, string> = {
  Nootropic:   "#6b9fd4",
  Base:        "#a0a0b8",
  Flavour:     "#d4a56b",
  Electrolyte: "#c46bd4",
  Sweetener:   "#d46b6b",
  Vitamin:     "#6bd4c4",
  Other:       "#8a8a9a",
};

function getColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Other"];
}

/* ─── Physics Types ──────────────────────────────────────────────────────────── */
interface PhysNode {
  id: string;
  label: string;
  category: string;
  amount?: string;
  description?: string;
  study_url?: string;
  x: number;            // current position
  y: number;
  vx: number;           // velocity
  vy: number;
  radius: number;
}

interface Edge { source: string; target: string; restLength: number; }

/* ─── Build web-like Obsidian-style graph ───────────────────────────────────── */
function buildGraph(
  recipe: Recipe,
  W: number,
  H: number
): { nodes: PhysNode[]; edges: Edge[] } {
  const cx = W / 2;
  const cy = H / 2;

  // Group by category
  const byCat: Record<string, Ingredient[]> = {};
  for (const ing of recipe.ingredients) {
    const cat = INGREDIENT_META[ing.name]?.category ?? "Other";
    (byCat[cat] ??= []).push(ing);
  }

  const allIngredients = recipe.ingredients;
  const nodeMap = new Map<string, PhysNode>();
  const nodes: PhysNode[] = [];
  const edges: Edge[] = [];

  // Create ingredient nodes distributed around the canvas in a web-like pattern
  const angleSlice = (Math.PI * 2) / allIngredients.length;
  const baseRadius = 180;
  
  allIngredients.forEach((ing, idx) => {
    const meta = INGREDIENT_META[ing.name];
    const category = meta?.category ?? "Other";
    
    // Use a more organic distribution by varying radius and adding slight randomization
    const angle = idx * angleSlice + (Math.random() - 0.5) * 0.4;
    const radiusVar = baseRadius + (Math.random() - 0.5) * 80;
    
    const node: PhysNode = {
      id: ing.name,
      label: ing.name,
      category,
      amount: `${ing.amount} ${ing.unit}`,
      description: meta?.description,
      study_url: meta?.study_url,
      x: cx + Math.cos(angle) * radiusVar,
      y: cy + Math.sin(angle) * radiusVar,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: 14,
    };
    nodes.push(node);
    nodeMap.set(ing.name, node);
  });

  // Create a web of connections - connect each ingredient to 2-3 nearest neighbors
  // and also connect ingredients in the same category
  const categoryMap = new Map<string, PhysNode[]>();
  nodes.forEach((node) => {
    if (!categoryMap.has(node.category)) {
      categoryMap.set(node.category, []);
    }
    categoryMap.get(node.category)!.push(node);
  });

  // Connect same-category ingredients together
  categoryMap.forEach((categoryNodes) => {
    for (let i = 0; i < categoryNodes.length; i++) {
      for (let j = i + 1; j < categoryNodes.length; j++) {
        edges.push({
          source: categoryNodes[i].id,
          target: categoryNodes[j].id,
          restLength: 140,
        });
      }
    }
  });

  // Add some cross-category connections for the web effect
  for (let i = 0; i < nodes.length; i++) {
    // Connect to 1-2 random different-category nodes
    const numConnections = Math.floor(Math.random() * 2) + 1;
    for (let c = 0; c < numConnections; c++) {
      let j = Math.floor(Math.random() * nodes.length);
      if (j !== i && nodes[j].category !== nodes[i].category) {
        const edgeKey = [nodes[i].id, nodes[j].id].sort().join('-');
        // Avoid duplicate edges
        if (!edges.some((e) => 
          (e.source === nodes[i].id && e.target === nodes[j].id) ||
          (e.source === nodes[j].id && e.target === nodes[i].id)
        )) {
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            restLength: 180,
          });
        }
      }
    }
  }

  return { nodes, edges };
}

/* ─── Physics tick ──────────────────────────────────────────────────────────── */
function tick(
  nodes: PhysNode[],
  edges: Edge[],
  W: number,
  H: number
) {
  const MAP = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Node-node repulsion - gentler to allow more clustering
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const minD = a.radius + b.radius + 28;
      if (dist < minD) {
        const f = ((minD - dist) / dist) * 0.25;
        a.vx -= dx * f;
        a.vy -= dy * f;
        b.vx += dx * f;
        b.vy += dy * f;
      }
    }
  }

  // Spring edges
  for (const e of edges) {
    const a = MAP[e.source], b = MAP[e.target];
    if (!a || !b) continue;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = ((dist - e.restLength) / dist) * 0.08;
    a.vx += dx * f;
    a.vy += dy * f;
    b.vx -= dx * f;
    b.vy -= dy * f;
  }

  // Gentle ambient drift + dampen + boundaries
  for (const n of nodes) {
    n.vx += (Math.random() - 0.5) * 0.12;
    n.vy += (Math.random() - 0.5) * 0.12;
    n.vx *= 0.85;
    n.vy *= 0.85;
    n.x = Math.max(n.radius + 4, Math.min(W - n.radius - 4, n.x + n.vx));
    n.y = Math.max(n.radius + 4, Math.min(H - n.radius - 4, n.y + n.vy));
  }
}

/* ─── Canvas renderer ───────────────────────────────────────────────────────── */
function render(
  ctx: CanvasRenderingContext2D,
  nodes: PhysNode[],
  edges: Edge[],
  hoveredId: string | null,
  W: number,
  H: number
) {
  ctx.clearRect(0, 0, W, H);
  const MAP = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // Edges
  for (const e of edges) {
    const a = MAP[e.source], b = MAP[e.target];
    if (!a || !b) continue;
    const isRelated = hoveredId === a.id || hoveredId === b.id || hoveredId === e.source || hoveredId === e.target;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = isRelated ? "rgba(127,174,143,0.5)" : "rgba(60,60,66,0.3)";
    ctx.lineWidth = isRelated ? 1.5 : 0.8;
    ctx.stroke();
  }

  // Nodes
  for (const n of nodes) {
    const color = getColor(n.category);
    const isHov = n.id === hoveredId;
    const r = n.radius + (isHov ? 5 : 0);

    // Glow
    if (isHov) {
      ctx.shadowBlur = 24;
      ctx.shadowColor = color;
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + (isHov ? "dd" : "99");
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/* ─── Mobile fallback card grid ─────────────────────────────────────────────── */
function MobileCards({ recipe }: { recipe: Recipe }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {recipe.ingredients.map((ing) => {
        const meta = INGREDIENT_META[ing.name];
        const color = getColor(meta?.category ?? "Other");
        return (
          <div key={ing.name} style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${color}33`,
            borderRadius: "var(--radius-lg)",
            padding: "20px",
          }}>
            {meta?.category && (
              <p className="text-label" style={{ marginBottom: "8px", color }}>{meta.category}</p>
            )}
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "4px" }}>{ing.name}</h3>
            <p className="text-mono" style={{ color, fontSize: "0.8rem", marginBottom: "10px" }}>
              {ing.amount} {ing.unit}
            </p>
            {meta?.description && (
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: meta.study_url ? "12px" : 0 }}>
                {meta.description}
              </p>
            )}
            {meta?.study_url && (
              <a href={meta.study_url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.75rem", color, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                View study →
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main export ─────────────────────────────────────────────────────────────── */
export default function IngredientGraph({ recipe }: { recipe: Recipe }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const nodesRef   = useRef<PhysNode[]>([]);
  const edgesRef   = useRef<Edge[]>([]);
  const hovIdRef   = useRef<string | null>(null);
  const animRef    = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<PhysNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const CW = 820, CH = 540;

  // Responsive check
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const cb = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);

  // Canvas animation
  useEffect(() => {
    if (isMobile) return;
    const { nodes, edges } = buildGraph(recipe, CW, CH);
    nodesRef.current = nodes;
    edgesRef.current = edges;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function loop() {
      tick(nodesRef.current, edgesRef.current, CW, CH);
      render(ctx, nodesRef.current, edgesRef.current, hovIdRef.current, CW, CH);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [recipe, isMobile]);

  function getHovered(clientX: number, clientY: number): PhysNode | null {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CW / rect.width;
    const scaleY = CH / rect.height;

    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;
    for (const n of nodesRef.current) {
      const dx = mx - n.x, dy = my - n.y;
      if (dx * dx + dy * dy <= (n.radius + 8) ** 2) return n;
    }
    return null;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const found = getHovered(e.clientX, e.clientY);
    hovIdRef.current = found?.id ?? null;
    setHoveredNode(found);
    const rect = canvasRef.current!.getBoundingClientRect();
    if (found) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setTooltipPos(null);
    }
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const found = getHovered(e.clientX, e.clientY);
    if (found?.study_url) window.open(found.study_url, "_blank", "noopener");
  }

  if (isMobile) return <MobileCards recipe={recipe} />;

  return (
    <div style={{ position: "relative", maxWidth: `${CW}px`, margin: "0 auto" }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          hovIdRef.current = null;
          setHoveredNode(null);
          setTooltipPos(null);
        }}
        onClick={handleClick}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          cursor: hoveredNode?.study_url ? "pointer" : hoveredNode ? "default" : "default",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}
      />

      {/* Tooltip */}
      {hoveredNode && tooltipPos && (
        <div
          style={{
            position: "absolute",
            left: Math.min(tooltipPos.x + 14, 820 - 240),
            top: Math.max(tooltipPos.y - 60, 4),
            pointerEvents: "none",
            background: "var(--bg)",
            border: `1px solid ${getColor(hoveredNode.category)}55`,
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            width: "210px",
            boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 20px ${getColor(hoveredNode.category)}18`,
            zIndex: 10,
          }}
        >
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: getColor(hoveredNode.category), marginBottom: "2px" }}>
            {hoveredNode.label}
          </p>
          {hoveredNode.amount && (
            <p className="text-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "7px" }}>
              {hoveredNode.amount}
            </p>
          )}
          {hoveredNode.description && (
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {hoveredNode.description}
            </p>
          )}
          {hoveredNode.study_url && (
            <p style={{ fontSize: "0.7rem", color: "var(--accent-dim)", marginTop: "8px" }}>
              Click to view study →
            </p>
          )}
        </div>
      )}
    </div>
  );
}
