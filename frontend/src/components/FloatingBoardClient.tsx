"use client";

import type { NoteData } from "../app/actions";
import FloatingNote from "./FloatingNote";

interface FloatingBoardClientProps {
  initialNotes: NoteData[];
}

export default function FloatingBoardClient({ initialNotes }: FloatingBoardClientProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {initialNotes.map((note) => (
        <div key={note.id} className="pointer-events-auto absolute inset-0">
          <FloatingNote note={note} />
        </div>
      ))}
    </div>
  );
}
