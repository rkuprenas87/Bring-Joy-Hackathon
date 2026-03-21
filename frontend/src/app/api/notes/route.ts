import { NextResponse } from "next/server";
import { addNote, clearNotes, deleteNote, getNotes } from "../../actions";

export async function GET() {
  try {
    const notes = await getNotes();
    return NextResponse.json(notes);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let formData: FormData;

    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();
    } else {
      const body = (await request.json()) as { text?: string; type?: string };
      formData = new FormData();
      formData.append("text", String(body.text ?? ""));
      formData.append("type", String(body.type ?? "sticky"));
    }

    const result = await addNote(formData);
    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json({ success: true, note: result.note }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all");

    if (clearAll === "1" || clearAll === "true") {
      const result = await clearNotes();
      if (result.error) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    const id = (searchParams.get("id") ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const result = await deleteNote(id);
    if (result.error) {
      const status = result.error === "Note not found" ? 404 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
