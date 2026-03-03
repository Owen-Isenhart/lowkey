import type { Metadata } from "next";
import { getRecipeHistory, getStableRecipe, readRecipeFile } from "@/lib/recipes";
import ChangelogEntry from "@/components/shared/ChangelogEntry";

export const metadata: Metadata = {
  title: "Recipe Changelog",
  description:
    "The full version-controlled history of the Lowkey formula. Every tweak, tracked.",
};

export default function ChangelogPage() {
  const history = getRecipeHistory();
  const stable  = getStableRecipe();

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Recipe Changelog</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>Formula history</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "56px" }}>
        Current stable:{" "}
        <span className="text-mono" style={{ color: "var(--accent)" }}>{stable.version}</span>
        {"  "}·{"  "}{stable.name}
      </p>

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

        {history.map((entry) => {
          const recipe = readRecipeFile(entry.filename);
          return (
            <ChangelogEntry key={entry.filename} entry={entry} recipe={recipe} />
          );
        })}
      </ol>
    </div>
  );
}
