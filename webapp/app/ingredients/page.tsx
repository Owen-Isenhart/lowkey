import type { Metadata } from "next";
import { getStableRecipe } from "@/lib/recipes";
import IngredientGraph from "@/components/shared/IngredientGraph";

export const metadata: Metadata = {
  title: "Ingredient Decoder",
  description:
    "Explore the science behind every ingredient in Lowkey's nootropic and electrolyte stack.",
};

export default function IngredientsPage() {
  const recipe = getStableRecipe();

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Ingredient Decoder</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>What&apos;s inside.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "48px" }}>
        Current formula{" "}
        <span className="text-mono" style={{ color: "var(--accent)" }}>{recipe.version}</span>
        {" "}— hover a node to learn more. Click to open studies.
      </p>

      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        {[
          { label: "Nootropic",   color: "#6b9fd4" },
          { label: "Base",        color: "#a0a0b8" },
          { label: "Flavour",     color: "#d4a56b" },
          { label: "Electrolyte", color: "#c46bd4" },
          { label: "Sweetener",   color: "#d46b6b" },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: color, flexShrink: 0,
            }} />
            <span className="text-label">{label}</span>
          </div>
        ))}
      </div>

      <IngredientGraph recipe={recipe} />
    </div>
  );
}
