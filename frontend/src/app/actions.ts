"use server";

import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { revalidatePath } from "next/cache";

export type NoteType = "sticky" | "crumpled" | "plane";

export interface NoteData {
  id: string;
  text: string;
  type: NoteType;
  color?: string;
  imageUrl?: string;
}

export interface NoteBroadcastEvent {
  eventType: "note_added" | "note_deleted" | "notes_cleared";
  note?: NoteData;
  id?: string;
}

const WS_BROADCAST_URL =
  process.env.WS_BROADCAST_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3001/broadcast"
    : "https://papersky.onrender.com/broadcast");

const STICKY_COLORS = ["bg-yellow-200", "bg-green-200", "bg-orange-200", "bg-blue-200"];
const CRUMPLED_COLORS = ["bg-pink-200", "bg-purple-200", "bg-teal-200", "bg-rose-200"];
const PLANE_COLORS = ["text-blue-300", "text-indigo-400", "text-emerald-400", "text-sky-300"];

export async function getNotes(): Promise<NoteData[]> {
  try {
    return (await kv.get<NoteData[]>("notes")) ?? [];
  } catch {
    return [];
  }
}

export async function addNote(formData: FormData): Promise<{ success?: true; note?: NoteData; error?: string }> {
  const rawText = String(formData.get("text") ?? "");
  const text = rawText.trim();
  const type = String(formData.get("type") ?? "sticky") as NoteType;
  const imageFile = formData.get("image") as File | null;

  if (!text && !(imageFile && imageFile.size > 0)) {
    return { error: "Invalid input" };
  }

  let imageUrl: string | undefined;

  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, { access: "public" });
      imageUrl = blob.url;
    } catch {
      return { error: "Failed to upload image" };
    }
  }

  let color = "";
  if (type === "sticky") color = STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)];
  else if (type === "crumpled") color = CRUMPLED_COLORS[Math.floor(Math.random() * CRUMPLED_COLORS.length)];
  else color = PLANE_COLORS[Math.floor(Math.random() * PLANE_COLORS.length)];

  const newNote: NoteData = {
    id: `${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
    text: text.slice(0, 100),
    type,
    color,
    ...(imageUrl ? { imageUrl } : {}),
  };

  try {
    const existingNotes = await getNotes();
    existingNotes.push(newNote);
    await kv.set("notes", existingNotes);

    try {
      const event: NoteBroadcastEvent = { eventType: "note_added", note: newNote };
      await fetch(WS_BROADCAST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch {
      // WebSocket service is optional during local dev.
    }

    revalidatePath("/");
    return { success: true, note: newNote };
  } catch {
    return { error: "Failed to save note" };
  }
}

export async function deleteNote(id: string): Promise<{ success?: true; error?: string }> {
  const trimmedId = id.trim();
  if (!trimmedId) {
    return { error: "Missing note id" };
  }

  try {
    const existingNotes = await getNotes();
    const nextNotes = existingNotes.filter((note) => note.id !== trimmedId);

    if (nextNotes.length === existingNotes.length) {
      return { error: "Note not found" };
    }

    await kv.set("notes", nextNotes);

    try {
      const event: NoteBroadcastEvent = { eventType: "note_deleted", id: trimmedId };
      await fetch(WS_BROADCAST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch {
      // WebSocket service is optional during local dev.
    }

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to delete note" };
  }
}

export async function clearNotes(): Promise<{ success?: true; error?: string }> {
  try {
    await kv.set("notes", []);

    try {
      const event: NoteBroadcastEvent = { eventType: "notes_cleared" };
      await fetch(WS_BROADCAST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch {
      // WebSocket service is optional during local dev.
    }

    revalidatePath("/");
    return { success: true };
  } catch {
    return { error: "Failed to clear notes" };
  }
}
