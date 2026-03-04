import type { LowkeyEvent } from "@/types";

export async function getUpcomingEvents(): Promise<LowkeyEvent[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    try {
        console.log("[getUpcomingEvents] Fetching from", `${apiUrl}/events`);
        const res = await fetch(`${apiUrl}/events`, { next: { revalidate: 0 } });
        if (!res.ok) {
            console.error("[getUpcomingEvents] Response not ok:", res.status, res.statusText);
            return [];
        }
        const events = await res.json();
        console.log("[getUpcomingEvents] Got events:", events.length, events);
        return events;
    } catch (e) {
        console.error("[getUpcomingEvents] Failed to fetch events", e);
        return [];
    }
}

export async function getEventById(id: number): Promise<LowkeyEvent | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    try {
        console.log("[getEventById] Fetching event", id);
        const res = await fetch(`${apiUrl}/events/${id}`, { next: { revalidate: 0 } });
        if (!res.ok) {
            console.error("[getEventById] Response not ok:", res.status, res.statusText);
            return null;
        }
        const event = await res.json();
        console.log("[getEventById] Got event:", event);
        return event;
    } catch (e) {
        console.error("[getEventById] Failed to fetch event", e);
        return null;
    }
}
