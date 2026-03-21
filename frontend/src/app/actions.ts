"use server";

export type NoteType = "sticky" | "crumpled" | "plane";

export interface NoteData {
  id: string;
  text: string;
  type: NoteType;
  color: string;
  imageUrl?: string;
}

const NOTES: NoteData[] = [
  {
    id: "1",
    text: "You are doing great.",
    type: "sticky",
    color: "bg-yellow-100",
  },
  {
    id: "2",
    text: "Small wins count too.",
    type: "crumpled",
    color: "bg-pink-100",
  },
  {
    id: "3",
    text: "Keep going, one step at a time.",
    type: "plane",
    color: "bg-blue-100",
  },
];

export async function getNotes(): Promise<NoteData[]> {
  return NOTES;
}

export async function addNote(formData: FormData): Promise<void> {
  const text = String(formData.get("text") ?? "").trim();
  const type = String(formData.get("type") ?? "sticky") as NoteType;

  if (!text) {
    return;
  }

  NOTES.unshift({
    id: String(Date.now()),
    text,
    type,
    color:
      type === "sticky"
        ? "bg-yellow-100"
        : type === "crumpled"
          ? "bg-pink-100"
          : "bg-blue-100",
  });
}
