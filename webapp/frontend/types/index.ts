// ─── Recipe Types ─────────────────────────────────────────────────────────────

export interface NutritionPer100g {
    calories: number;
    carbs_g: number;
    sugar_g: number;
    sodium_mg: number;
}

export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
    cost_per_bulk: number;
    bulk_amount: number;
    bulk_unit: string;
    nutrition_per_100g: NutritionPer100g;
    /** Optional fields for richer Ingredient Decoder data */
    category?: string;
    description?: string;
    study_url?: string;
}

export interface Recipe {
    version: string;
    name: string;
    total_volume_oz: number;
    ingredients: Ingredient[];
    notes?: string;
}

export interface RecipeHistoryEntry {
    version: string;
    name: string;
    filename: string;
    dateLabel: string;
    isStable: boolean;
}

// ─── Batch / QR Types ─────────────────────────────────────────────────────────

export interface Batch {
    id: string;
    recipe_version: string;
    mixed_at: string;       // ISO 8601
    ph_level: number;
    notes?: string;
    image_url?: string;
    ingredient_sources: IngredientSource[];
}

export interface IngredientSource {
    ingredient_name: string;
    supplier: string;
    lot_number: string;
}

// ─── Store / Events Types ──────────────────────────────────────────────────────

export interface StoreLocation {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    type: "retail" | "campus" | "online";
}

export interface LowkeyEvent {
    id: number;
    title: string;
    description?: string;
    location: string;
    city: string;
    lat?: number;
    lng?: number;
    date: string;    // ISO 8601
    end_date?: string;
    image_url?: string;
    is_hidden?: boolean;
}

// ─── Shop Types ────────────────────────────────────────────────────────────────

export interface Product {
    id: number;
    slug: string;
    name: string;
    description: string;
    price_cents: number;
    image_url?: string;
    obj_model_path?: string;
    type: "single" | "subscription";
    active: boolean;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

// ─── Admin / Banner Types ───────────────────────────────────────────────────────

export interface Banner {
    id: string;
    title: string;
    content: string;
    banner_type: "info" | "warning" | "success" | "error";
    is_active: boolean;
    expires_at: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}
