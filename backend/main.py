# from fastapi import FastAPI
# from pydantic import BaseModel
# from enum import Enum
#
# app = FastAPI()
#
# class NoteType(str, Enum):
#     post_it = "post-it note"
#     paper_airplane = "paper airplane"
#     heart = "heart"
#     smiley_face = "smiley face"
#     puppy = "puppy"
#     kitty = "kitty"
#     minion = "minion"
#
# class UserMessage(BaseModel):
#     message: str
#     note_type: NoteType
#
# @app.get("/")
# def read_root():
#     return {"message": "FastAPI is working"}
#
# @app.post("/chat")
# def chat(user_message: UserMessage):
#     return {
#         "response": f'You sent a "{user_message.note_type}" note that says: {user_message.message}'
#     }




from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")
            note_type = data.get("note_type", "post-it note")

            await websocket.send_json({
                "response": f'You sent a "{note_type}" note that says: {message}'
            })

    except WebSocketDisconnect:
        print("Client disconnected")