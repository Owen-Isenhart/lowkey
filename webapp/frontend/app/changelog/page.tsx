"use client";

import { useEffect, useState } from "react";
import { getRecipeHistory, getStableRecipe, getAvailableFlavors, readRecipeFile } from "@/app/actions/recipes";
import ChangelogEntry from "@/components/shared/ChangelogEntry";
import type { Recipe, RecipeHistoryEntry } from "@/types";

export default function ChangelogPage() {
  const [flavors, setFlavors] = useState<string[]>([]);
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [history, setHistory] = useState<RecipeHistoryEntry[]>([]);
  const [stable, setStable] = useState<Recipe | null>(null);
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

  // Load history and stable recipe when flavor changes
  useEffect(() => {
    if (selectedFlavor) {
      setLoading(true);
      setHistory([]); // Clear previous history to avoid stale file references
      (async () => {
        try {
          const historyData = await getRecipeHistory(selectedFlavor);
          const stableData = await getStableRecipe(selectedFlavor);
          setHistory(historyData);
          setStable(stableData);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [selectedFlavor]);

  if (!stable || loading) {
    return (
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px 120px" }}>
        <p className="text-label" style={{ marginBottom: "16px" }}>Recipe Changelog</p>
        <h1 className="text-heading" style={{ marginBottom: "8px" }}>Formula history</h1>
        <p style={{ color: "var(--text-secondary)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Recipe Changelog</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>Formula history</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Current stable:{" "}
        <span className="text-mono" style={{ color: "var(--accent)" }}>{stable.version}</span>
        {"  "}·{"  "}{stable.name}
      </p>

      {/* Flavor selector */}
      <div style={{ marginBottom: "40px" }}>
        <label htmlFor="changelog-flavor-select" style={{ 
          display: "block", 
          marginBottom: "8px", 
          color: "var(--text-secondary)",
          fontSize: "0.875rem"
        }}>
          Select Flavor:
        </label>
        <select
          id="changelog-flavor-select"
          value={selectedFlavor}
          onChange={(e) => {
            setSelectedFlavor(e.target.value);
            setLoading(true);
            setHistory([]);
          }}
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

      <ol style={{ listStyle: "none", position: "relative" }}>
        {/* Vertical connector line */}
        <div style={{
          position: "absolute",
          left: "7px",
          top: "10px",
          bottom: 0,
          width: "1px",
          background: "var(--border)",
        }} />

        {!loading && history.length > 0 && history.map((entry, index) => (
          <ChangelogEntryWrapper
            key={`${selectedFlavor}-${entry.filename}`}
            flavor={selectedFlavor}
            entry={entry}
            isLast={index === history.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

// Separate component to load recipe data for each entry
function ChangelogEntryWrapper({
  flavor,
  entry,
  isLast,
}: {
  flavor: string;
  entry: RecipeHistoryEntry;
  isLast: boolean;
}) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setError(false);
        const recipeData = await readRecipeFile(flavor, entry.filename);
        setRecipe(recipeData);
      } catch (err) {
        console.warn(`Failed to load recipe ${flavor}/${entry.filename}:`, err);
        setError(true);
      }
    })();
  }, [flavor, entry]);

  // Don't render if there was an error loading the recipe
  if (error) return null;
  if (!recipe) return null;
  return <ChangelogEntry entry={entry} recipe={recipe} isLast={isLast} />;
}
