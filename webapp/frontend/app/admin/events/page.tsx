import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import EventsManager from "./EventsManager";
import type { LowkeyEvent } from "@/types";

export const metadata: Metadata = { title: "Admin — Events" };

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");

  const token = (session as any)?.backendToken;
  if (!token) {
    return (
      <div>
        <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
        <h1 className="text-heading" style={{ marginBottom: "40px" }}>Events</h1>
        <p style={{ color: "var(--text-muted)" }}>Unable to load events. Please try signing out and back in.</p>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const events = await fetch(`${apiUrl}/events`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
    .then((res) => res.ok ? res.json() : [])
    .catch(() => [] as LowkeyEvent[]);

  return (
    <div>
      <p className="text-label" style={{ marginBottom: "8px" }}>Admin</p>
      <h1 className="text-heading" style={{ marginBottom: "40px" }}>Events</h1>
      <EventsManager events={events} />
    </div>
  );
}
