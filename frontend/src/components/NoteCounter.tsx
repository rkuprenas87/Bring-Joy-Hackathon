import { getNotes } from "../app/actions";

export default async function NoteCounter() {
  const notes = await getNotes();

  return (
    <div className="absolute top-8 right-5 z-20 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
      {notes.length} notes floating
    </div>
  );
}
