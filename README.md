# Bring Joy Hackathon

Paper Sky is a collaborative kindness wall where people send short uplifting notes that float across the screen in real time.

The app combines:
- a Next.js frontend for UI and note APIs
- a FastAPI websocket service for live broadcast events
- a JSON data store for simple persistence

## Live App

- Production URL: northland-hackathon-2026.vercel.app
- Repository: https://github.com/EmilioMonteLuna/northland-hackathon-2026

## Project Structure

```text
.
├── backend/                # FastAPI websocket broadcast service
│   ├── requirements.txt
│   └── ws.py
├── data/                   # JSON note persistence
│   └── notes.json
├── frontend/               # Next.js app (UI + API routes)
│   ├── public/             # Static assets (note images, icons)
│   └── src/
│       ├── app/
│       │   ├── api/notes/route.ts
│       │   └── actions.ts
│       └── components/
└── README.md
```

## Features

- Real-time note updates across connected clients via websocket broadcast
- Three note styles: sticky, crumpled paper, and paper plane
- Optional image upload attached to a note
- Create, delete, and clear notes
- Smooth animated UI built with Framer Motion

## Tech Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- Backend realtime service: FastAPI + Uvicorn
- Data storage: JSON file (`data/notes.json`)
- Deployment: Render

## Local Development

### 1. Prerequisites

- Node.js 20+
- Python 3.11+

### 2. Clone and install

From repo root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

From `frontend/`:

```bash
npm install
```

### 3. Run both services (recommended)

From `frontend/`:

```bash
npm run dev
```

This starts:
- Next.js app: `http://localhost:3000`
- FastAPI websocket service: `ws://localhost:3001`

### 4. Run services separately

From `frontend/`:

```bash
npm run dev:next
```

From `frontend/` (uses repo virtual env):

```bash
npm run dev:ws
```

## API Endpoints

The frontend exposes note APIs at `frontend/src/app/api/notes/route.ts`:

- `GET /api/notes` -> list notes
- `POST /api/notes` -> create note
- `DELETE /api/notes?id=<id>` -> delete one note
- `DELETE /api/notes?all=1` -> clear all notes

The websocket service in `backend/ws.py` exposes:

- `WS /` -> websocket endpoint for live clients
- `POST /broadcast` -> internal broadcast event endpoint

## Environment Variables

Optional variables used by the app:

- `NOTES_DB_PATH`: custom path to notes JSON file
- `NOTES_UPLOADS_DIR`: custom path for uploaded images
- `NEXT_PUBLIC_WS_URL`: websocket URL used by frontend client
- `WS_BROADCAST_URL`: HTTP URL used by server actions to broadcast events

Defaults are configured for local development (`localhost:3001`) and production fallback values.

## Deployment Notes (Render)

- Production deploys from the `main` branch.
- When frontend/backend changes are made on feature branches, merge into `main` first.
- Trigger `Manual Deploy -> Deploy latest commit` on Render if auto-deploy is not enabled.

## Team Notes

- Keep `data/notes.json` out of feature PRs unless intentionally changing seed data.
- Commit uploaded/static UI assets under `frontend/public/`.
- Prefer small PRs that isolate UI, backend, and data changes where possible.
