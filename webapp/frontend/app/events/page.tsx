import type { Metadata } from "next";
import Link from "next/link";
import { getUpcomingEvents } from "@/services/events";
import type { LowkeyEvent } from "@/types";

export const metadata: Metadata = {
  title: "Events",
  description: "Find Lowkey at campus events, pop-ups, and local meetups near you.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function isPastEvent(event: LowkeyEvent): boolean {
  const eventEndTime = event.end_date ? new Date(event.end_date) : new Date(event.date);
  return eventEndTime < new Date();
}

export default async function EventsPage() {
  console.log("[EventsPage] Fetching events from getUpcomingEvents()");
  const events = await getUpcomingEvents().catch(() => [] as LowkeyEvent[]);
  
  console.log("[EventsPage] Got events from service:", events.length);
  events.forEach((e: LowkeyEvent) => {
    console.log(`  - Event ${e.id}: "${e.title}" at ${e.date}, is_hidden=${e.is_hidden}`);
  });

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 24px 120px" }}>
      <p className="text-label" style={{ marginBottom: "16px" }}>Events</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>All events.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "48px" }}>
        Campus pop-ups, launch events, and wherever Lowkey shows up. Past events are grayed out.
      </p>

      {events.length === 0 ? (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No events yet. Follow us to stay in the loop.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((event: LowkeyEvent) => {
            const isPast = isPastEvent(event);
            return (
            <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
              <li
                className="card-hover"
                style={{
                  display: "flex",
                  gap: "24px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "22px 24px",
                  opacity: isPast ? 0.55 : 1,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                }}
              >
                {/* Date badge */}
                <div style={{ flexShrink: 0, minWidth: "48px", textAlign: "center", paddingTop: "2px" }}>
                  <p style={{
                    fontSize: "1.5rem",
                    fontWeight: 300,
                    lineHeight: 1,
                    color: isPast ? "var(--text-muted)" : "var(--accent)",
                    letterSpacing: "-0.03em",
                  }}>
                    {new Date(event.date).getDate()}
                  </p>
                  <p className="text-label">
                    {new Date(event.date).toLocaleString("en-US", { month: "short" })}
                  </p>
                </div>

                {/* Details */}
                <div>
                  <h2 style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: "4px", color: isPast ? "var(--text-secondary)" : "var(--text-primary)" }}>
                    {event.title}
                  </h2>
                  <p style={{ fontSize: "0.8125rem", color: isPast ? "var(--text-muted)" : "var(--text-secondary)", marginBottom: "4px" }}>
                    {event.location} · {event.city}
                  </p>
                  <p className="text-label">{formatDate(event.date)}</p>
                  {event.description && (
                    <p style={{
                      marginTop: "10px",
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      lineHeight: 1.6,
                    }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </li>
            </Link>
            );
          })}
        </ul>
      )}
    </div>
  );
}
