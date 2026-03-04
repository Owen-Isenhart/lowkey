import { z } from "zod";

// ─── Batch ID ────────────────────────────────────────────────────────────────
// e.g. "LK-001" — uppercase letters, dash, digits only
export const BatchIdSchema = z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z]{1,4}-\d{1,6}$/, "Batch ID must match format LK-001");

// ─── Event ───────────────────────────────────────────────────────────────────
export const EventSchema = z.object({
    title: z.string().min(1, "Required").max(120).trim(),
    description: z.string().max(1000).trim().optional(),
    location: z.string().min(1, "Required").max(200).trim(),
    city: z.string().min(1, "Required").max(100).trim(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    date: z.string().min(1, "Required").refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
    end_date: z.string().optional().refine(
        (v) => !v || !isNaN(Date.parse(v)), "Invalid end date"
    ),
    image_url: z.string().url().optional(),
});

export type EventInput = z.infer<typeof EventSchema>;

// ─── Batch ───────────────────────────────────────────────────────────────────
export const BatchSchema = z.object({
    id: BatchIdSchema,
    recipe_version: z.string().min(1).max(32).trim(),
    mixed_at: z.string().min(1).refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
    ph_level: z.coerce.number().min(0).max(14).optional(),
    notes: z.string().max(2000).trim().optional(),
    image_url: z.string().url().optional(),
});

export type BatchInput = z.infer<typeof BatchSchema>;

// ─── Batch Ingredient Source ──────────────────────────────────────────────────
export const BatchSourceSchema = z.object({
    ingredient_name: z.string().min(1).max(120).trim(),
    supplier: z.string().min(1).max(200).trim(),
    lot_number: z.string().min(1).max(80).trim(),
});

export type BatchSourceInput = z.infer<typeof BatchSourceSchema>;

// ─── Banner ───────────────────────────────────────────────────────────────────
export const BannerSchema = z.object({
    title: z.string().min(1, "Required").max(255).trim(),
    content: z.string().min(1, "Required").max(2000).trim(),
    bannerType: z.enum(["info", "warning", "success", "error"], { 
        errorMap: () => ({ message: "Select a banner type" })
    }),
    expiresAt: z.string().optional()
        .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid expiration date")
        .refine((v) => !v || new Date(v) > new Date(), "Expiration must be in the future"),
});

export type BannerInput = z.infer<typeof BannerSchema>;

// ─── Validation helpers ───────────────────────────────────────────────────────

/** Parse a Zod schema from FormData, returning typed result or null with error map. */
export function parseFormData<T extends z.ZodTypeAny>(
    schema: T,
    formData: FormData
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
    const raw: Record<string, unknown> = {};
    formData.forEach((value, key) => {
        raw[key] = typeof value === "string" ? value : undefined;
    });
    const result = schema.safeParse(raw);
    if (result.success) return { success: true, data: result.data };
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        errors[key] = issue.message;
    }
    return { success: false, errors };
}
