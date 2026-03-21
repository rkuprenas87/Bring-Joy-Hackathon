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
    
    random_note = random.choice(notes)
    return random_note

if __name__ == "__main__":
    import uvicorn
    # Running this on 8001 so it doesn't collide with your main.py (8000)
    uvicorn.run(app, host="127.0.0.1", port=8001)