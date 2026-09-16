from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import engine
from .dependencies import get_db
from .models import Base, Temple
from .schemas import TempleDetail, TempleSummary

app = FastAPI(title="Guntur Heritage Atlas API", version="0.3.0")

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
        "version": "0.3.0",
    }


@app.get("/api/temples", response_model=list[TempleSummary])
def list_temples(db: Session = Depends(get_db)) -> list[TempleSummary]:
    temples = db.scalars(select(Temple).order_by(Temple.name)).all()
    return [
        TempleSummary(
            id=temple.temple_id,
            name=temple.name,
            city="Guntur",
            status="research-record",
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
        city="Guntur",
        status="research-record",
        deity=temple.deity,
        locality=temple.locality,
        latitude=temple.latitude,
        longitude=temple.longitude,
        description=temple.description,
        evidence="Initial research record; historical claims require source-level verification.",
    )
