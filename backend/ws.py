import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)
        print(f"✅ Client connected ({len(self.active_connections)} total)")

    def disconnect(self, ws: WebSocket):
        self.active_connections.remove(ws)
        print(f"❌ Client disconnected ({len(self.active_connections)} total)")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/broadcast")
async def broadcast(request: Request):
    body = await request.body()
    await manager.broadcast(body.decode('utf-8'))
    return PlainTextResponse("ok", status_code=200)

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from clients, but we need to keep the connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    uvicorn.run(
        "ws:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 3001)),
        reload=False,
    )
