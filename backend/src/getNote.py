import json
import os
import random
from fastapi import FastAPI, HTTPException

app = FastAPI()
JSON_FILE = "database.json"

@app.get("/random-note")
def get_random_note():
    # 1. Check if file exists
    if not os.path.exists(JSON_FILE):
        raise HTTPException(status_code=404, detail="No notes found yet!")

    # 2. Read the file
    with open(JSON_FILE, "r") as f:
        notes = json.load(f)

    # 3. Pick a random one
    if not notes:
        raise HTTPException(status_code=404, detail="The note list is empty.")
    
    for note in notes:
        if note.get("id") == id:
            return note
        
    random_note = random.choice(notes)
    return random_note

def get_specific_note(note_id: int):
    if not os.path.exists(JSON_FILE):
        raise HTTPException(status_code=404, detail="No notes found yet!")

    with open(JSON_FILE, "r") as f:
        notes = json.load(f)

    for note in notes:
        if note.get("id") == note_id:
            return note

    raise HTTPException(status_code=404, detail=f"Note with id {note_id} not found.")

if __name__ == "__main__":
    import uvicorn
    # Running this on 8001 so it doesn't collide with your main.py (8000)
    uvicorn.run(app, host="127.0.0.1", port=8001)