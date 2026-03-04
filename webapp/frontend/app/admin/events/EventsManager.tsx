"use client";

import { useRef, useState } from "react";
import { createEvent, deleteEvent, toggleEventVisibility } from "@/app/admin/actions";
import type { LowkeyEvent } from "@/types";

interface Props { events: LowkeyEvent[] }

const FIELDS = [
  { name: "title",       label: "Title *",       type: "text",           placeholder: "Lowkey Campus Pop-Up" },
  { name: "description", label: "Description",    type: "textarea",       placeholder: "Brief description of the event…" },
  { name: "location",    label: "Location *",     type: "text",           placeholder: "Union Building, Room 201" },
  { name: "city",        label: "City *",         type: "text",           placeholder: "Austin, TX" },
  { name: "date",        label: "Date & Time *",  type: "datetime-local", placeholder: "" },
  { name: "end_date",    label: "End Date",        type: "datetime-local", placeholder: "" },
  { name: "lat",         label: "Latitude",        type: "number",         placeholder: "30.2849" },
  { name: "lng",         label: "Longitude",       type: "number",         placeholder: "-97.7341" },
  { name: "image_url",   label: "Image URL",       type: "url",            placeholder: "https://example.com/event-banner.jpg" },
];

export default function EventsManager({ events: initialEvents }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [events, setEvents] = useState<LowkeyEvent[]>(initialEvents);
  const [state, setState] = useState<{ status: "idle" | "loading" | "ok" | "error"; message?: string; errors?: Record<string, string> }>({ status: "idle" });
  const [deleting, setDeleting] = useState<number | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setState({ status: "loading" });
    const fd = new FormData(formRef.current);
    
    const result = await createEvent(fd);
    if ("success" in result) {
      // Use the actual event data from server
      setEvents([...events, result.event]);
      setState({ status: "ok", message: "Event created." });
      formRef.current.reset();
      
      // Clear success message after 3 seconds
      setTimeout(() => setState({ status: "idle" }), 3000);
    } else {
      setState({ status: "error", message: result.error, errors: result.errors });
    }
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    const result = await deleteEvent(id);
    if ("success" in result) {
      setEvents(events.filter(e => e.id !== id));
    }
    setDeleting(null);
  }

  async function handleToggleVisibility(id: number, isCurrentlyHidden: boolean) {
    setToggling(id);
    const result = await toggleEventVisibility(id, !isCurrentlyHidden);
    if ("success" in result) {
      setEvents(events.map(e => 
        e.id === id ? { ...e, is_hidden: !isCurrentlyHidden } : e
      ));
    }
    setToggling(null);
  }

  return (
    <div>
      {/* Existing events */}
      <section style={{ marginBottom: "48px" }}>
        <p className="text-label" style={{ marginBottom: "16px" }}>All Events ({events.length})</p>
        {events.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No events yet.</p>
        ) : (
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {events.map((ev) => (
              <li key={ev.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px",
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
              }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                  {ev.image_url && (
                    <img src={ev.image_url} alt={ev.title}
                      style={{
                        width: "48px", height: "48px", objectFit: "cover",
                        borderRadius: "var(--radius-sm)", flexShrink: 0
                      }} 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{ev.title}</p>
                    <p className="text-label">{ev.city} · {new Date(ev.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggleVisibility(ev.id, ev.is_hidden ?? false)}
                    disabled={toggling === ev.id}
                    style={{
                      background: "none",
                      border: `1px solid ${ev.is_hidden ? "#ffb94644" : "#5dba6344"}`,
                      borderRadius: "var(--radius-sm)",
                      color: ev.is_hidden ? "#ffb946" : "#5dba63",
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      opacity: toggling === ev.id ? 0.5 : 1,
                    }}
                  >
                    {toggling === ev.id ? "Updating…" : (ev.is_hidden ? "Hidden" : "Visible")}
                  </button>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    disabled={deleting === ev.id}
                    style={{
                      background: "none", border: "1px solid #d46b6b44", borderRadius: "var(--radius-sm)",
                      color: "#d46b6b", padding: "6px 12px", fontSize: "0.75rem", cursor: "pointer",
                      opacity: deleting === ev.id ? 0.5 : 1, flexShrink: 0
                    }}
                  >
                    {deleting === ev.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create form */}
      <section>
        <p className="text-label" style={{ marginBottom: "16px" }}>New Event</p>
        <form ref={formRef} onSubmit={handleCreate}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "680px" }}>
          {FIELDS.map(({ name, label, type, placeholder }) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: "6px",
              gridColumn: type === "textarea" ? "1 / -1" : "auto" }}>
              <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {label}
              </label>
              {type === "textarea" ? (
                <textarea name={name} placeholder={placeholder} rows={3}
                  style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: `1px solid ${state.errors?.[name] ? "#d46b6b88" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.875rem",
                    fontFamily: "inherit", resize: "vertical", outline: "none" }} />
              ) : (
                <input type={type} name={name} placeholder={placeholder}
                  style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: `1px solid ${state.errors?.[name] ? "#d46b6b88" : "var(--border)"}`,
                    borderRadius: "var(--radius-md)", color: "var(--text-primary)", fontSize: "0.875rem",
                    fontFamily: "inherit", outline: "none" }} />
              )}
              {state.errors?.[name] && (
                <p style={{ fontSize: "0.7rem", color: "#d46b6b" }}>{state.errors[name]}</p>
              )}
            </div>
          ))}

          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "16px" }}>
            <button type="submit" disabled={state.status === "loading"} className="btn-primary"
              style={{ opacity: state.status === "loading" ? 0.6 : 1 }}>
              {state.status === "loading" ? "Creating…" : "Create Event"}
            </button>
            {state.status === "ok" && (
              <p style={{ fontSize: "0.8rem", color: "var(--accent)" }}>{state.message}</p>
            )}
            {state.status === "error" && !Object.keys(state.errors ?? {}).length && (
              <p style={{ fontSize: "0.8rem", color: "#d46b6b" }}>{state.message}</p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
