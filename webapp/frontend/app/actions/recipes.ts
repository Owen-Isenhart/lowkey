"use server";

import fs from "fs";
import path from "path";
import type { Recipe, RecipeHistoryEntry } from "@/types";

// Path to the recipes directory relative to the project root (two levels above frontend/)
const RECIPES_DIR = path.resolve(process.cwd(), "..", "..", "recipes");

/** Read and parse a single recipe JSON file by flavor and filename. */
export async function readRecipeFile(flavor: string, filename: string): Promise<Recipe> {
    const filePath = path.join(RECIPES_DIR, flavor, filename);
    
    // Validate file exists before attempting to read
    if (!fs.existsSync(filePath)) {
        throw new Error(`Recipe file not found: ${flavor}/${filename}`);
    }
    
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Recipe;
}

/** Get all available flavors. */
export async function getAvailableFlavors(): Promise<string[]> {
    const entries = fs.readdirSync(RECIPES_DIR, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

/** Return the current stable recipe for a flavor. */
export async function getStableRecipe(flavor?: string): Promise<Recipe> {
    if (!flavor) {
        // Default to first available flavor if not specified
        const flavors = await getAvailableFlavors();
        flavor = flavors[0];
    }
    return readRecipeFile(flavor, "STABLE.json");
}

/**
 * Scan the recipe flavor directory and return metadata for all JSON files.
 * STABLE.json is always first; remaining files are sorted by filename (descending)
 * so that the most recent version appears at the top of the changelog.
 */
export async function getRecipeHistory(flavor?: string): Promise<RecipeHistoryEntry[]> {
    if (!flavor) {
        // Default to first available flavor if not specified
        const flavors = await getAvailableFlavors();
        flavor = flavors[0];
    }
    
    const flavorDir = path.join(RECIPES_DIR, flavor);
    
    // Verify the flavor directory exists
    if (!fs.existsSync(flavorDir)) {
        return [];
    }
    
    const files = fs.readdirSync(flavorDir).filter((f) => f.endsWith(".json"));

    // Separate stable from versioned entries
    const stableFile = files.find((f) => f === "STABLE.json");
    const versionedFiles = files
        .filter((f) => f !== "STABLE.json")
        .sort((a, b) => b.localeCompare(a));     // newest first

    const toEntry = async (filename: string, isStable: boolean): Promise<RecipeHistoryEntry | null> => {
        const filePath = path.join(flavorDir, filename);
        
        // Validate file still exists (defensive check for race conditions)
        if (!fs.existsSync(filePath)) {
            return null;
        }
        
        try {
            const recipe = await readRecipeFile(flavor!, filename);
            let dateLabel = isStable ? "Current" : filename.replace(".json", "");
            return {
                version: recipe.version,
                name: recipe.name,
                filename,
                dateLabel,
                isStable,
            };
        } catch (err) {
            // Skip entries that fail to load
            console.warn(`Failed to load recipe metadata for ${flavor}/${filename}:`, err);
            return null;
        }
    };

    const history: RecipeHistoryEntry[] = [];
    if (stableFile) {
        const stableEntry = await toEntry(stableFile, true);
        if (stableEntry) history.push(stableEntry);
    }
    
    const versionedEntries = await Promise.all(versionedFiles.map((f) => toEntry(f, false)));
    history.push(...versionedEntries.filter((e) => e !== null) as RecipeHistoryEntry[]);

    return history;
}
