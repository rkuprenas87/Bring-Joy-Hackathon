from fastapi import FastAPI
from pydantic import BaseModel
from enum import Enum

app = FastAPI()

class NoteType(str, Enum):
    post_it = "post-it note"
    paper_airplane = "paper airplane"
    heart = "heart"
    smiley_face = "smiley face"
    puppy = "puppy"
    kitty = "kitty"
    minion = "minion"

class UserMessage(BaseModel):
    message: str
    note_type: NoteType

@app.get("/")
def read_root():
    return {"message": "FastAPI is working"}

@app.post("/chat")
def chat(user_message: UserMessage):
    return {
        "response": f'You sent a "{user_message.note_type}" note that says: {user_message.message}'
    }