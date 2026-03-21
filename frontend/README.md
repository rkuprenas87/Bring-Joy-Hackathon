# Paper Sky Frontend

Next.js frontend for the Paper Sky demo app. It talks to the Python websocket server in `../backend` for realtime note updates and uses the Next API/routes for note persistence.

## Prerequisites

- Node 20+
- Python 3.11+

## One-Time Setup

From repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

From `frontend`:

```bash
npm install
```

## Run (Recommended)

From `frontend`:

```bash
npm run dev
```

This starts both services:

- Next.js app on `http://localhost:3000`
- Python websocket server on `ws://localhost:3001`

## Run Separately

From `frontend`:

```bash
npm run dev:next
```

From `frontend` (starts backend websocket process through the repository virtualenv):

```bash
npm run dev:ws
```

## Useful Endpoints

- `GET /api/notes` list notes
- `POST /api/notes` create note
- `DELETE /api/notes?id=<note-id>` delete one
- `DELETE /api/notes?all=1` clear all

## Render Deployment Variables

Set these in your frontend service environment:

- `NEXT_PUBLIC_WS_URL=wss://papersky.onrender.com/`
- `WS_BROADCAST_URL=https://papersky.onrender.com/broadcast`

Without these, local defaults are used in development (`localhost:3001`).

## Demo Tips

- Keep one browser tab open as the "main screen".
- Share the same app URL with teammates/audience.
- Notes should appear live; if websocket fails in some network setups, polling fallback still updates notes automatically.
