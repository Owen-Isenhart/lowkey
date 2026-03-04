"use server";

import { requireAdmin, handleActionError } from "@/lib/admin-guard";
import {
    EventSchema,
    BatchSchema,
    BatchSourceSchema,
    BannerSchema,
    parseFormData,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";

// ─── Events ───────────────────────────────────────────────────────────────────

export async function createEvent(
    formData: FormData
): Promise<{ success: true; event: any } | { error: string; errors?: Record<string, string> }> {
    try {
        await requireAdmin();

        const parsed = parseFormData(EventSchema, formData);
        if (!parsed.success) {
            return { error: "Validation failed.", errors: parsed.errors };
        }

        const { title, description, location, city, lat, lng, date, end_date, image_url } = parsed.data;

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        console.log("[createEvent] Creating event:", { title, city, date, apiUrl });

        const res = await fetch(`${apiUrl}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description: description ?? null,
                location,
                city,
                lat: lat ?? null,
                lng: lng ?? null,
                date: new Date(date).toISOString(),
                end_date: end_date ? new Date(end_date).toISOString() : null,
                image_url: image_url ?? null,
            })
        });

        console.log("[createEvent] Response status:", res.status);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("[createEvent] Error response:", errorData);
            throw new Error(errorData.error || "Backend failed to create event");
        }

        const event = await res.json();
        console.log("[createEvent] Event created:", event);
        
        console.log("[createEvent] Revalidating paths");
        revalidatePath("/");
        revalidatePath("/events");
        revalidatePath("/admin/events");
        
        return { success: true, event };
    } catch (err) {
        console.error("[createEvent] Error:", err);
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

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const res = await fetch(`${apiUrl}/events/${numId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Backend failed to delete event");

        revalidatePath("/events");
        revalidatePath("/admin/events");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}

export async function toggleEventVisibility(
    id: unknown,
    isHidden: boolean
): Promise<{ success: true } | { error: string }> {
    try {
        await requireAdmin();

        const numId = Number(id);
        if (!Number.isInteger(numId) || numId <= 0) {
            return { error: "Invalid event ID." };
        }

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        console.log(`[toggleEventVisibility] Toggling event ${numId} to is_hidden=${isHidden}`);

        const res = await fetch(`${apiUrl}/events/${numId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ is_hidden: isHidden })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Backend failed to update event visibility");
        }

        console.log(`[toggleEventVisibility] Event ${numId} visibility updated`);
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
): Promise<{ success: true; batchId: string; batch: any } | { error: string; errors?: Record<string, string> }> {
    try {
        await requireAdmin();

        const parsed = parseFormData(BatchSchema, formData);
        if (!parsed.success) {
            return { error: "Validation failed.", errors: parsed.errors };
        }

        const { id: batchId, recipe_version, mixed_at, ph_level, notes, image_url } = parsed.data;

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const res = await fetch(`${apiUrl}/batches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: batchId,
                recipe_version,
                mixed_at: new Date(mixed_at).toISOString(),
                ph_level: ph_level ?? null,
                notes: notes ?? null,
                image_url: image_url ?? null
            })
        });

        if (res.status === 409) {
            return { error: "Validation failed.", errors: { id: "Batch ID already exists." } };
        }
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Backend failed to create batch");
        }

        const batch = await res.json();
        revalidatePath("/");
        revalidatePath("/batch");
        revalidatePath("/admin/batches");
        return { success: true, batchId, batch };
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

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const res = await fetch(`${apiUrl}/batches/${parsed.data}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Backend failed to delete batch");

        revalidatePath("/admin/batches");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export async function createBanner(
    formData: FormData
): Promise<{ success: true; bannerId: string; banner: any } | { error: string; errors?: Record<string, string> }> {
    try {
        await requireAdmin();

        const parsed = parseFormData(BannerSchema, formData);
        if (!parsed.success) {
            return { error: "Validation failed.", errors: parsed.errors };
        }

        const { title, content, bannerType, expiresAt } = parsed.data;

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const res = await fetch(`${apiUrl}/banners`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content,
                bannerType,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Backend failed to create banner");
        }

        const banner = await res.json();
        revalidatePath("/admin");
        revalidatePath("/admin/banners");
        return { success: true, bannerId: String(banner.id), banner };
    } catch (err) {
        return handleActionError(err);
    }
}

export async function deleteBanner(
    id: unknown
): Promise<{ success: true } | { error: string }> {
    try {
        await requireAdmin();

        // Banner IDs are UUIDs, just validate as string
        if (typeof id !== 'string' || !id.trim()) {
            return { error: "Invalid banner ID." };
        }

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const res = await fetch(`${apiUrl}/banners/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Backend failed to delete banner");
        }

        revalidatePath("/admin");
        revalidatePath("/admin/banners");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}export async function addBatchSource(
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

        const { token } = await requireAdmin();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const res = await fetch(`${apiUrl}/batches/${idParsed.data}/sources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ingredient_name, supplier, lot_number })
        });

        if (!res.ok) throw new Error("Backend failed to add batch source");

        revalidatePath("/admin/batches");
        return { success: true };
    } catch (err) {
        return handleActionError(err);
    }
}
