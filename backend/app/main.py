"""FastAPI service for the Guntur Heritage Atlas."""

import json
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import engine
from .dependencies import get_db
from .models import Base, Locality, Source, Temple
from .schemas import (
    LocalityDetail,
    LocalitySummary,
    SourceSummary,
    TempleDetail,
    TempleSummary,
)

ROOT = Path(__file__).resolve().parents[2]
ROUTE_DIR = ROOT / "data" / "routes"
HISTORICAL_DIR = ROOT / "data" / "historical-observations"

app = FastAPI(title="Guntur Heritage Atlas API", version="0.7.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables_and_seed() -> None:
    Base.metadata.create_all(bind=engine)
    from .seed import seed
    seed()


def source_summary(source: Source) -> SourceSummary:
    return SourceSummary(
        id=source.source_id,
        title=source.title,
        publisher=source.publisher,
        url=source.url,
        source_type=source.source_type,
    )


def read_json(path: Path, missing_detail: str) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=missing_detail)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"Invalid JSON data: {path.name}")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "guntur-heritage-atlas", "version": "0.7.0"}


@app.get("/api/stats")
def stats(db: Session = Depends(get_db)) -> dict[str, int]:
    return {
        "temples": len(db.scalars(select(Temple)).all()),
        "localities": len(db.scalars(select(Locality)).all()),
        "sources": len(db.scalars(select(Source)).all()),
        "routes": len(list(ROUTE_DIR.glob("*.json"))),
        "historical_observations": len(list(HISTORICAL_DIR.glob("*.json"))),
    }


@app.get("/api/temples", response_model=list[TempleSummary])
def list_temples(db: Session = Depends(get_db)) -> list[TempleSummary]:
    temples = db.scalars(select(Temple).order_by(Temple.name)).all()
    return [
        TempleSummary(
            id=temple.temple_id,
            name=temple.name,
            city=temple.locality.name if temple.locality else "Guntur",
            status=temple.evidence_status,
        )
        for temple in temples
    ]


@app.get("/api/temples/{temple_id}", response_model=TempleDetail)
def get_temple(temple_id: str, db: Session = Depends(get_db)) -> TempleDetail:
    temple = db.scalar(select(Temple).where(Temple.temple_id == temple_id))
    if temple is None:
        raise HTTPException(status_code=404, detail="Temple not found")
    return TempleDetail(
        id=temple.temple_id,
        name=temple.name,
        city=temple.locality.name if temple.locality else "Guntur",
        status=temple.evidence_status,
        deity=temple.deity,
        locality=temple.locality.name if temple.locality else None,
        latitude=temple.latitude,
        longitude=temple.longitude,
        description=temple.description,
        evidence=temple.evidence_status,
        sources=[source_summary(source) for source in temple.sources],
    )


@app.get("/api/localities", response_model=list[LocalitySummary])
def list_localities(db: Session = Depends(get_db)) -> list[LocalitySummary]:
    localities = db.scalars(select(Locality).order_by(Locality.name)).all()
    return [
        LocalitySummary(
            id=locality.locality_id,
            name=locality.name,
            type=locality.locality_type,
            district=locality.current_district,
            status=locality.evidence_status,
        )
        for locality in localities
    ]


@app.get("/api/localities/{locality_id}", response_model=LocalityDetail)
def get_locality(locality_id: str, db: Session = Depends(get_db)) -> LocalityDetail:
    locality = db.scalar(select(Locality).where(Locality.locality_id == locality_id))
    if locality is None:
        raise HTTPException(status_code=404, detail="Locality not found")
    temples = [
        TempleSummary(
            id=temple.temple_id,
            name=temple.name,
            city=locality.name,
            status=temple.evidence_status,
        )
        for temple in sorted(locality.temples, key=lambda item: item.name)
    ]
    return LocalityDetail(
        id=locality.locality_id,
        name=locality.name,
        type=locality.locality_type,
        district=locality.current_district,
        status=locality.evidence_status,
        state=locality.state,
        country=locality.country,
        name_origin=locality.name_origin_summary,
        history=locality.history_summary,
        temples=temples,
        sources=[source_summary(source) for source in locality.sources],
    )


@app.get("/api/routes")
def list_routes() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(ROUTE_DIR.glob("*.json")):
        try:
            records.append(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            continue
    return records


@app.get("/api/routes/{route_id}")
def get_route(route_id: str) -> dict[str, Any]:
    return read_json(ROUTE_DIR / f"{route_id}.json", "Route not found")


@app.get("/api/historical-observations")
def list_historical_observations() -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in sorted(HISTORICAL_DIR.glob("*.json")):
        try:
            records.append(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError):
            continue
    return records


@app.get("/api/historical-observations/{record_id}")
def get_historical_observation(record_id: str) -> dict[str, Any]:
    return read_json(HISTORICAL_DIR / f"{record_id}.json", "Historical observation not found")
