import type { Metadata } from "next";
import { getUpcomingEvents } from "@/services/events";
import { query } from "@/lib/db";
import EventsManager from "./EventsManager";
import type { LowkeyEvent } from "@/types";

export const metadata: Metadata = { title: "Admin — Events" };

export default async function AdminEventsPage() {
  // Fetch ALL events (past + upcoming) for admin view
  const events = await query<LowkeyEvent>(
    "SELECT * FROM events ORDER BY date DESC"
  ).catch(() => [] as LowkeyEvent[]);

  return (
    <div>
      <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>Events</h1>
      <EventsManager events={events} />
    </div>
  );
}
