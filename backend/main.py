from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from enum import Enum
import json

app = FastAPI()


class NoteType(str, Enum):
    post_it = "post-it note"
    paper_airplane = "paper airplane"
    heart = "heart"
    smiley_face = "smiley face"
    minion = "minion"
    puppy = "puppy"
    kitty = "kitty"


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)


manager = ConnectionManager()


@app.get("/")
def read_root():
    return {"message": "Kindness is Contagious 💛"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        await manager.send_personal_message(
            {"type": "system", "message": "Connected to Kindness is Contagious 💛"},
            websocket
        )

        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)

            recipient = payload.get("recipient", "").strip()
            message_text = payload.get("message", "").strip()
            note_type = payload.get("note_type", "post-it note")

            if not recipient:
                await manager.send_personal_message(
                    {"type": "error", "message": "Recipient name cannot be empty."},
                    websocket
                )
                continue

            if not message_text:
                await manager.send_personal_message(
                    {"type": "error", "message": "Message cannot be empty."},
                    websocket
                )
                continue

            await manager.broadcast({
                "type": "note",
                "recipient": recipient,
                "note_type": note_type,
                "message": message_text
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast({
            "type": "system",
            "message": "Someone left the board"
        })