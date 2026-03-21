import { getNotes } from "../app/actions";
import FloatingBoardClient from "./FloatingBoardClient";

export default async function FloatingBoard() {
  // Fetch notes on the server
  const notes = await getNotes();

  // Pass them to the client component that handles the randomized positioning and animations
  return <FloatingBoardClient initialNotes={notes} />;
}