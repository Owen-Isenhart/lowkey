"use client";

import { useEffect, useState } from "react";
import { getStableRecipe, getAvailableFlavors } from "@/app/actions/recipes";
import IngredientGraph from "@/components/shared/IngredientGraph";
import type { Recipe } from "@/types";

export default function IngredientsPage() {
  const [flavors, setFlavors] = useState<string[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  // Load available flavors on mount
  useEffect(() => {
    (async () => {
      const available = await getAvailableFlavors();
      setFlavors(available);
      if (available.length > 0) {
        setSelectedFlavor(available[0]);
      }
    })();
  }, []);

  // Load recipe when flavor changes
  useEffect(() => {
    if (selectedFlavor) {
      setLoading(true);
      setRecipe(null); // Clear previous recipe
      (async () => {
        try {
          const newRecipe = await getStableRecipe(selectedFlavor);
          setRecipe(newRecipe);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [selectedFlavor]);

  if (!recipe || loading) {
    return (
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
        <p className="text-label" style={{ marginBottom: "16px" }}>Ingredient Decoder</p>
        <h1 className="text-heading" style={{ marginBottom: "8px" }}>What&apos;s inside.</h1>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Ingredient Decoder</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>What&apos;s inside.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Current formula{" "}
        <span className="text-mono" style={{ color: "var(--accent)" }}>{recipe.version}</span>
        {" "}— hover a node to learn more. Click to open studies.
      </p>

      {/* Flavor selector */}
      <div style={{ marginBottom: "32px" }}>
        <label htmlFor="flavor-select" style={{ 
          display: "block", 
          marginBottom: "8px", 
          color: "var(--text-secondary)",
          fontSize: "0.875rem"
        }}>
          Select Flavor:
        </label>
        <select
          id="flavor-select"
          value={selectedFlavor}
          onChange={(e) => setSelectedFlavor(e.target.value)}
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            fontSize: "1rem",
            fontFamily: "inherit",
            cursor: "pointer",
            minWidth: "180px",
          }}
        >
          {flavors.map((flavor) => (
            <option key={flavor} value={flavor}>
              {flavor.charAt(0).toUpperCase() + flavor.slice(1).replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

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
