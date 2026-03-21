import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const PORT = 3001;

// Create HTTP + WebSocket server
const server = http.createServer((req, res) => {
  // POST /broadcast — called by Next.js when a note is added
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      // Broadcast the new note to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(body);
        }
      });
      res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
      res.end("ok");
    });
    return;
  }

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log(`✅ Client connected (${wss.clients.size} total)`);
  ws.on("close", () => {
    console.log(`❌ Client disconnected (${wss.clients.size} total)`);
  });
});

server.listen(PORT, () => {
  console.log(`☁️  Paper Sky WebSocket server running on ws://localhost:${PORT}`);
});
