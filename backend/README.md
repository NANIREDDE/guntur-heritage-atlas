# Backend

FastAPI service for the Guntur Heritage Atlas.

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

API documentation is available at `http://localhost:8000/docs` while the server is running.

Health check: `GET /api/health`

Temple endpoints:

- `GET /api/temples` — list research records
- `GET /api/temples/{temple_id}` — retrieve one temple record

The local SQLite database is created at `backend/guntur_heritage.db` and is intentionally ignored by Git. Research JSON files under `data/temples/` remain the durable, reviewable source records; the database is a local runtime copy. SQLite is appropriate for local development, with PostgreSQL planned for a later deployment stage. citeturn0search0turn0search3
