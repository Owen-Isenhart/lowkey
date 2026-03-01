"use server";

import { requireAdmin, handleActionError } from "@/lib/admin-guard";
import { query, queryOne } from "@/lib/db";
import {
    EventSchema,
    BatchSchema,
    BatchSourceSchema,
    parseFormData,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEvent(
    formData: FormData
): Promise<{ success: true } | { error: string; errors?: Record<string, string> }> {
    try {
        await requireAdmin();

        const parsed = parseFormData(EventSchema, formData);
        if (!parsed.success) {
            return { error: "Validation failed.", errors: parsed.errors };
        }

        const { title, description, location, city, lat, lng, date, end_date } = parsed.data;

        await query(
            `INSERT INTO events (title, description, location, city, lat, lng, date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                title,
                description ?? null,
                location,
                city,
                lat ?? null,
                lng ?? null,
                new Date(date).toISOString(),
                end_date ? new Date(end_date).toISOString() : null,
            ]
        );

        revalidatePath("/events");
        revalidatePath("/admin/events");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}

export async function deleteEvent(
    id: unknown
): Promise<{ success: true } | { error: string }> {
    try {
        await requireAdmin();

        // Validate id is a safe integer — never interpolated into SQL
        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) {
            return { error: "Invalid event ID." };
        }

        await query("DELETE FROM events WHERE id = $1", [numId]);
        revalidatePath("/events");
        revalidatePath("/admin/events");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}

// ─── Batches ──────────────────────────────────────────────────────────────────

export async function createBatch(
    formData: FormData
): Promise<{ success: true; batchId: string } | { error: string; errors?: Record<string, string> }> {
    try {
        await requireAdmin();

        const parsed = parseFormData(BatchSchema, formData);
        if (!parsed.success) {
            return { error: "Validation failed.", errors: parsed.errors };
        }

        const { id, recipe_version, mixed_at, ph_level, notes } = parsed.data;

        // Check for duplicate ID
        const existing = await queryOne<{ id: string }>(
            "SELECT id FROM batches WHERE id = $1",
            [id]
        );
        if (existing) {
            return { error: "Validation failed.", errors: { id: "Batch ID already exists." } };
        }

        await query(
            `INSERT INTO batches (id, recipe_version, mixed_at, ph_level, notes)
       VALUES ($1, $2, $3, $4, $5)`,
            [id, recipe_version, new Date(mixed_at).toISOString(), ph_level ?? null, notes ?? null]
        );

        revalidatePath("/admin/batches");
        return { success: true, batchId: id };
    } catch (err) {
        return handleActionError(err);
    }
}

export async function deleteBatch(
    id: unknown
): Promise<{ success: true } | { error: string }> {
    try {
        await requireAdmin();

        // Validate batch ID format before using it
        const parsed = BatchSchema.shape.id.safeParse(id);
        if (!parsed.success) return { error: "Invalid batch ID." };

        await query("DELETE FROM batches WHERE id = $1", [parsed.data]);
        revalidatePath("/admin/batches");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}

export async function addBatchSource(
    batchId: unknown,
    formData: FormData
): Promise<{ success: true } | { error: string; errors?: Record<string, string> }> {
    try {
        await requireAdmin();

        const idParsed = BatchSchema.shape.id.safeParse(batchId);
        if (!idParsed.success) return { error: "Invalid batch ID." };

        const parsed = parseFormData(BatchSourceSchema, formData);
        if (!parsed.success) return { error: "Validation failed.", errors: parsed.errors };

        const { ingredient_name, supplier, lot_number } = parsed.data;

        await query(
            `INSERT INTO batch_ingredient_sources (batch_id, ingredient_name, supplier, lot_number)
       VALUES ($1, $2, $3, $4)`,
            [idParsed.data, ingredient_name, supplier, lot_number]
        );

        revalidatePath("/admin/batches");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}
