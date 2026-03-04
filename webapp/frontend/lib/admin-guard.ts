import { auth } from "@/lib/auth";

/**
 * Server-side admin guard.
 *
 * Re-fetches user profile via Express API with Backend JWT.
 * Throws a typed Error if:
 * - No session exists (unauthenticated)
 * - `isAdmin` is false via API (not admin)
 */
export async function requireAdmin(): Promise<{ userId: string; email: string; token: string }> {
    const session = await auth();
    const token = (session as any)?.backendToken;

    if (!session?.user?.id || !session.user.email || !token) {
        throw new AdminError("Unauthenticated");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });

    if (!res.ok) {
        throw new AdminError("Forbidden");
    }

    const data = await res.json();
    if (!data?.isAdmin) {
        throw new AdminError("Forbidden");
    }

    return { userId: session.user.id, email: session.user.email, token };
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
