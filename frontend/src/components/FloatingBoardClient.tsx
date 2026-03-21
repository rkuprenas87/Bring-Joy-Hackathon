"use client";

import { useEffect, useMemo, useState } from "react";
import type { NoteBroadcastEvent, NoteData } from "../app/actions";
import FloatingNote from "./FloatingNote";

interface FloatingBoardClientProps {
  initialNotes: NoteData[];
}

const MAX_RENDERED_NOTES = 80;
const RENDER_WS_URL = "wss://papersky.onrender.com/";

function appendUniqueNote(prev: NoteData[], incoming: NoteData): NoteData[] {
  if (!incoming.id || prev.some((note) => note.id === incoming.id)) {
    return prev;
  }
  const next = [...prev, incoming];
  return next.slice(-MAX_RENDERED_NOTES);
}

function resolveDefaultWsUrl(): string {
  if (typeof window === "undefined") {
    return "ws://localhost:3001/";
  }

  const { protocol, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "ws://localhost:3001/";
  }

  if (hostname === "papersky.onrender.com") {
    return RENDER_WS_URL;
  }

  if (hostname.includes("onrender.com")) {
    return RENDER_WS_URL;
  }

  const wsProtocol = protocol === "https:" ? "wss" : "ws";
  return `${wsProtocol}://${hostname}/`;
}

export default function FloatingBoardClient({ initialNotes }: FloatingBoardClientProps) {
  const [notes, setNotes] = useState<NoteData[]>(initialNotes.slice(-MAX_RENDERED_NOTES));

  useEffect(() => {
    setNotes(initialNotes.slice(-MAX_RENDERED_NOTES));
  }, [initialNotes]);

  useEffect(() => {
    const handleLocalCreate = (event: Event) => {
      const customEvent = event as CustomEvent<NoteData>;
      if (!customEvent.detail) {
        return;
      }
      setNotes((prev) => appendUniqueNote(prev, customEvent.detail));
    };

    window.addEventListener("note:created", handleLocalCreate as EventListener);

    const pollId = window.setInterval(async () => {
      try {
        const response = await fetch("/api/notes", { cache: "no-store" });
        if (!response.ok) {
          return;
        }
        const latest = (await response.json()) as NoteData[];
        if (!Array.isArray(latest)) {
          return;
        }
        setNotes(latest.slice(-MAX_RENDERED_NOTES));
      } catch {
        // Ignore polling errors and keep websocket/local event updates.
      }
    }, 4000);

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || resolveDefaultWsUrl();
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as NoteBroadcastEvent | NoteData;
        if (!parsed || typeof parsed !== "object") {
          return;
        }

        if ("eventType" in parsed) {
          if (parsed.eventType === "notes_cleared") {
            setNotes([]);
            return;
          }

          if (parsed.eventType === "note_deleted" && parsed.id) {
            setNotes((prev) => prev.filter((note) => note.id !== parsed.id));
            return;
          }

          if (parsed.eventType === "note_added" && parsed.note) {
            const incoming = parsed.note;
            setNotes((prev) => appendUniqueNote(prev, incoming));
            return;
          }

          return;
        }

        const incoming = parsed as NoteData;
        if (!incoming.id) {
          return;
        }
        setNotes((prev) => appendUniqueNote(prev, incoming));
      } catch {
        // Ignore malformed WS payloads.
      }
    };

    return () => {
      window.removeEventListener("note:created", handleLocalCreate as EventListener);
      window.clearInterval(pollId);
      socket.close();
    };
  }, []);

  const renderedNotes = useMemo(() => notes, [notes]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {renderedNotes.map((note) => (
        <div key={note.id} className="pointer-events-auto absolute inset-0">
          <FloatingNote note={note} />
        </div>
      ))}
    </div>
  );
}
