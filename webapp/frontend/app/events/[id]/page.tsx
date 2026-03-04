import { getEventById } from "@/services/events";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isPastEvent(event: { date: string; end_date?: string }): boolean {
  const eventEndTime = event.end_date ? new Date(event.end_date) : new Date(event.date);
  return eventEndTime < new Date();
}

export async function generateMetadata({ params }: EventDetailPageProps) {
    const { id } = await params;
    const event = await getEventById(parseInt(id));
    return {
        title: event ? event.title : "Event Not Found",
    };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = await params;
    const event = await getEventById(parseInt(id));

    if (!event) {
        notFound();
    }

    const isEventPast = isPastEvent(event);

    return (
        <main style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "64px 24px 120px" }}>
                {/* Back Button */}
                <div style={{ marginBottom: "32px" }}>
                    <Link
                        href="/events"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "var(--accent)",
                            textDecoration: "none",
                            fontSize: "0.9375rem",
                            fontWeight: 500,
                        }}
                    >
                        <span>←</span>
                        <span>Back to Events</span>
                    </Link>
                </div>

                {/* Content Card */}
                <article
                    style={{
                        borderRadius: "var(--radius-lg)",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--bg-elevated)",
                        overflow: "hidden",
                        opacity: isEventPast ? 0.7 : 1,
                        transition: "opacity var(--duration-normal) var(--ease-out)",
                    }}
                >
                    {/* Event Image */}
                    {event.image_url && (
                        <div style={{ position: "relative", width: "100%", height: "384px", overflow: "hidden" }}>
                            <img
                                src={event.image_url}
                                alt={event.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    opacity: isEventPast ? 0.6 : 1,
                                    transition: "opacity var(--duration-normal) var(--ease-out)",
                                    display: "block",
                                }}
                            />
                            {isEventPast && (
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        backgroundColor: "rgba(12, 12, 14, 0.4)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "1rem",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Past Event
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ padding: "40px" }}>
                        {/* Title */}
                        <h1
                            className="text-heading"
                            style={{
                                marginBottom: "32px",
                                color: isEventPast ? "var(--text-secondary)" : "var(--text-primary)",
                                transition: "color var(--duration-normal) var(--ease-out)",
                            }}
                        >
                            {event.title}
                        </h1>

                        {/* Meta Information */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "32px",
                                marginBottom: "32px",
                                paddingBottom: "32px",
                                borderBottom: "1px solid var(--border)",
                            }}
                        >
                            {/* Date & Time */}
                            <div>
                                <p
                                    className="text-label"
                                    style={{
                                        marginBottom: "8px",
                                        color: isEventPast ? "var(--text-muted)" : "var(--accent)",
                                    }}
                                >
                                    Date & Time
                                </p>
                                <p
                                    style={{
                                        fontSize: "1rem",
                                        fontWeight: 400,
                                        color: isEventPast ? "var(--text-secondary)" : "var(--text-primary)",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {formatDate(event.date)}
                                </p>
                                {event.end_date && (
                                    <p
                                        style={{
                                            fontSize: "0.875rem",
                                            color: isEventPast ? "var(--text-muted)" : "var(--text-secondary)",
                                        }}
                                    >
                                        to {formatDate(event.end_date)}
                                    </p>
                                )}
                            </div>

                            {/* Location */}
                            {event.location && (
                                <div>
                                    <p
                                        className="text-label"
                                        style={{
                                            marginBottom: "8px",
                                            color: isEventPast ? "var(--text-muted)" : "var(--accent)",
                                        }}
                                    >
                                        Location
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "1rem",
                                            fontWeight: 400,
                                            color: isEventPast ? "var(--text-secondary)" : "var(--text-primary)",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        {event.location}
                                    </p>
                                    {event.city && (
                                        <p
                                            style={{
                                                fontSize: "0.875rem",
                                                color: isEventPast ? "var(--text-muted)" : "var(--text-secondary)",
                                            }}
                                        >
                                            {event.city}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {event.description && (
                            <div style={{ marginBottom: "32px" }}>
                                <h2
                                    style={{
                                        fontSize: "1.125rem",
                                        fontWeight: 500,
                                        marginBottom: "16px",
                                        color: isEventPast ? "var(--text-secondary)" : "var(--text-primary)",
                                    }}
                                >
                                    About This Event
                                </h2>
                                <p
                                    style={{
                                        color: isEventPast ? "var(--text-secondary)" : "var(--text-secondary)",
                                        lineHeight: 1.65,
                                        fontSize: "0.9375rem",
                                    }}
                                >
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {/* Coordinates (for reference) */}
                        {event.lat && event.lng && (
                            <p
                                className="text-mono"
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.75rem",
                                }}
                            >
                                📍 {event.lat}, {event.lng}
                            </p>
                        )}
                    </div>
                </article>
            </div>
        </main>
    );
}
