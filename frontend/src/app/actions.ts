"use server";

import fs from "fs/promises";
import path from "path";
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

const WS_BROADCAST_URL = process.env.WS_BROADCAST_URL ?? "http://127.0.0.1:3001/broadcast";

function getDbPath(): string {
  if (process.env.NOTES_DB_PATH) {
    return process.env.NOTES_DB_PATH;
  }

  const cwd = process.cwd();
  if (path.basename(cwd) === "frontend") {
    return path.join(cwd, "..", "data", "notes.json");
  }

  return path.join(cwd, "data", "notes.json");
}

function getUploadsDir(): string {
  if (process.env.NOTES_UPLOADS_DIR) {
    return process.env.NOTES_UPLOADS_DIR;
  }

  const cwd = process.cwd();
  if (path.basename(cwd) === "frontend") {
    return path.join(cwd, "public", "uploads");
  }

  return path.join(cwd, "frontend", "public", "uploads");
}

const STICKY_COLORS = ["bg-yellow-200", "bg-green-200", "bg-orange-200", "bg-blue-200"];
const CRUMPLED_COLORS = ["bg-pink-200", "bg-purple-200", "bg-teal-200", "bg-rose-200"];
const PLANE_COLORS = ["text-blue-300", "text-indigo-400", "text-emerald-400", "text-sky-300"];

export async function getNotes(): Promise<NoteData[]> {
  const dbPath = getDbPath();
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return JSON.parse(data) as NoteData[];
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
    const uploadsDir = getUploadsDir();
    try {
      await fs.mkdir(uploadsDir, { recursive: true });

      const fileExtension = imageFile.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExtension}`;
      const filePath = path.join(uploadsDir, fileName);

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${fileName}`;
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
    const dbPath = getDbPath();
    const existingNotes = await getNotes();
    existingNotes.push(newNote);
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(existingNotes, null, 2), "utf-8");

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
    const dbPath = getDbPath();
    const existingNotes = await getNotes();
    const nextNotes = existingNotes.filter((note) => note.id !== trimmedId);

    if (nextNotes.length === existingNotes.length) {
      return { error: "Note not found" };
    }

    await fs.writeFile(dbPath, JSON.stringify(nextNotes, null, 2), "utf-8");

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
    const dbPath = getDbPath();
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify([], null, 2), "utf-8");

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
