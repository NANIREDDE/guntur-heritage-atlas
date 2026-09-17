# Guntur Heritage Atlas

A source-backed digital atlas of Guntur's temples, localities, people, events, architecture, and heritage routes.

## What works now

- React/Vite web atlas with search, temple/locality browsing, record detail panels and a first heritage route.
- FastAPI backend with health, statistics, temples, localities and route endpoints.
- SQLite/SQLAlchemy research layer that is automatically seeded from `data/` when the API starts.
- Source relationships and evidence-status fields so documented facts are kept separate from traditional or unverified claims.
- Initial research records for Guntur, Mangalagiri, Ponnur, Pedakakani and Undavalli, with five connected temple records.

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Backend

Open a second terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000` and the health check is `http://localhost:8000/api/health`.

The frontend has a small fallback dataset, so the visual atlas can still render while the backend is being started.

## Research principles

- Evidence before claims: historical statements should point to a source.
- Separate documented facts from oral traditions and interpretations.
- Stable IDs for heritage entities so records can be connected over time.
- Coordinates are not invented; unresolved locations remain unverified.
- The database is the source of truth; the web UI consumes the API.

## Repository layout

- `frontend/` - atlas UI, search, route explorer and record panels
- `backend/` - FastAPI API, validation, database and seed layer
- `data/temples/` - temple records
- `data/localities/` - locality and name-origin records
- `data/sources/` - source metadata
- `data/routes/` - connected heritage journeys
- `docs/` - architecture, data model and research methodology
- `scripts/` - future data import/validation utilities
- `tests/` - automated tests

## Current research coverage

The Guntur District government portal identifies temples in Mangalagiri, Ponnur and Pedakakani as prominent tourism locations and identifies Undavalli as a historically prominent location. The Archaeological Survey of India separately lists the four-storeyed rock-cut Hindu temple at Undavalli as a centrally protected monument/site. These are starting evidence layers; the project does not treat a government tourism description as the final word on chronology or origin.

## Branch workflow

Development is being built on `build/atlas-next`. The branch is intentionally kept separate from `main` until the research and application layers are reviewed.
