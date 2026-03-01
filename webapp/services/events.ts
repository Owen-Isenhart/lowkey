import type { LowkeyEvent } from "@/types";
import { query } from "@/lib/db";

export async function getUpcomingEvents(): Promise<LowkeyEvent[]> {
    return query<LowkeyEvent>(
        `SELECT id, title, description, location, city, lat, lng, date, end_date
     FROM events
     WHERE date >= NOW()
     ORDER BY date ASC`
    );
}
