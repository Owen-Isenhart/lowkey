import fs from "fs";
import path from "path";
import type { Recipe, RecipeHistoryEntry } from "@/types";

// Path to the recipes directory relative to the project root (one level above webapp/)
const RECIPES_DIR = path.resolve(process.cwd(), "..", "recipes");

/** Read and parse a single recipe JSON file by filename. */
export function readRecipeFile(filename: string): Recipe {
    const filePath = path.join(RECIPES_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Recipe;
}

/** Return the current stable recipe. */
export function getStableRecipe(): Recipe {
    return readRecipeFile("STABLE.json");
}

/**
 * Scan the recipes directory and return metadata for all JSON files.
 * STABLE.json is always first; remaining files are sorted by filename (descending)
 * so that the most recent version appears at the top of the changelog.
 */
export function getRecipeHistory(): RecipeHistoryEntry[] {
    const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".json"));

    // Separate stable from versioned entries
    const stableFile = files.find((f) => f === "STABLE.json");
    const versionedFiles = files
        .filter((f) => f !== "STABLE.json")
        .sort((a, b) => b.localeCompare(a));     // newest first

    const toEntry = (filename: string, isStable: boolean): RecipeHistoryEntry => {
        const recipe = readRecipeFile(filename);
        // Derive a human-readable date label from the filename when not stable
        // Expected format: YYYY-MM-DD_v1.0.1.json  OR just v1.0.1.json
        let dateLabel = isStable ? "Current" : filename.replace(".json", "");
        return {
            version: recipe.version,
            name: recipe.name,
            filename,
            dateLabel,
            isStable,
        };
    };

    const history: RecipeHistoryEntry[] = [];
    if (stableFile) history.push(toEntry(stableFile, true));
    history.push(...versionedFiles.map((f) => toEntry(f, false)));

    return history;
}
