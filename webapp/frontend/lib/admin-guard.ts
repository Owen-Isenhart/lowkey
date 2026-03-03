import { auth } from "@/lib/auth";
import { queryOne } from "@/lib/db";

/**
 * Server-side admin guard.
 *
 * Re-fetches `is_admin` from the database on every call — never trusts the
 * JWT alone. Call at the top of every Server Action that mutates data.
 *
 * Throws a typed Error if:
 * - No session exists (unauthenticated)
 * - `is_admin` is false in the database (not admin)
 */
export async function requireAdmin(): Promise<{ userId: string; email: string }> {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
        throw new AdminError("Unauthenticated");
    }

    // Re-verify from DB — JWT alone is not sufficient
    const row = await queryOne<{ is_admin: boolean }>(
        "SELECT is_admin FROM users WHERE id = $1",
        [session.user.id]
    );

    if (!row?.is_admin) {
        throw new AdminError("Forbidden");
    }

    return { userId: session.user.id, email: session.user.email };
}

export class AdminError extends Error {
    constructor(message: "Unauthenticated" | "Forbidden") {
        super(message);
        this.name = "AdminError";
    }
}

/** Helper to format Server Action errors for the client safely. */
export function handleActionError(err: unknown): { error: string } {
    if (err instanceof AdminError) {
        // Don't leak internal details
        return { error: "Access denied." };
    }
    // Never expose raw DB errors — log server-side only
    console.error("[Server Action Error]", err);
    return { error: "An unexpected error occurred. Please try again." };
}
