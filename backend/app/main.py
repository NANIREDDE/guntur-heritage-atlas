from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Guntur Heritage Atlas API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public API foundation. Authentication will protect research/editing endpoints later.

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "guntur-heritage-atlas", "version": "0.2.0"}

@app.get("/api/temples")
def list_temples():
    return {
        "items": [
            {
                "id": "GHA-TEM-0001",
                "name": "Agastyeshwara Sivalayam",
                "city": "Guntur",
                "status": "research-record",
            }
        ],
        "count": 1,
    }

@app.get("/api/temples/{temple_id}")
def get_temple(temple_id: str):
    if temple_id == "GHA-TEM-0001":
        return {
            "id": "GHA-TEM-0001",
            "name": "Agastyeshwara Sivalayam",
            "city": "Guntur",
            "status": "research-record",
            "evidence": "Initial research record; historical claims require source-level verification.",
        }
    return {"error": "Temple not found"}
