from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import engine
from .dependencies import get_db
from .models import Base, Locality, Temple
from .schemas import (
    LocalityDetail,
    LocalitySummary,
    SourceSummary,
    TempleDetail,
    TempleSummary,
)

app = FastAPI(title="Guntur Heritage Atlas API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "guntur-heritage-atlas",
        "version": "0.4.0",
    }


def source_summary(source) -> SourceSummary:
    return SourceSummary(
        id=source.source_id,
        title=source.title,
        publisher=source.publisher,
        url=source.url,
        source_type=source.source_type,
    )


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
    locality = db.scalar(
        select(Locality).where(Locality.locality_id == locality_id)
    )
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
