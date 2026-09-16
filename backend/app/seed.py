"""Seed the local SQLite database from the repository's research records."""

import json
from pathlib import Path

from sqlalchemy import select

from .database import SessionLocal, engine
from .models import Base, Locality, Source, Temple


ROOT = Path(__file__).resolve().parents[2]
TEMPLE_DIR = ROOT / "data" / "temples"
SOURCE_DIR = ROOT / "data" / "sources"


def seed_sources(db) -> int:
    inserted = 0
    for path in sorted(SOURCE_DIR.glob("*.json")):
        record = json.loads(path.read_text(encoding="utf-8"))
        source_id = record["source_id"]
        if db.scalar(select(Source).where(Source.source_id == source_id)):
            continue
        db.add(
            Source(
                source_id=source_id,
                title=record["title"],
                publisher=record.get("publisher"),
                url=record.get("url"),
                source_type=record.get("source_type"),
                reliability=record.get("reliability"),
            )
        )
        inserted += 1
    return inserted


def seed_temples(db) -> int:
    inserted = 0
    for path in sorted(TEMPLE_DIR.glob("*.json")):
        record = json.loads(path.read_text(encoding="utf-8"))
        temple_id = record["temple_id"]
        if db.scalar(select(Temple).where(Temple.temple_id == temple_id)):
            continue

        locality = None
        locality_id = record.get("locality_id")
        if locality_id:
            locality = db.scalar(
                select(Locality).where(Locality.locality_id == locality_id)
            )
            if locality is None:
                locality = Locality(
                    locality_id=locality_id,
                    name=locality_id,
                    evidence_status="needs-review",
                )
                db.add(locality)
                db.flush()

        location = record.get("location") or {}
        history = record.get("history") or {}
        db.add(
            Temple(
                temple_id=temple_id,
                name=record["name"],
                deity=record.get("deity"),
                locality=locality,
                latitude=location.get("latitude"),
                longitude=location.get("longitude"),
                description=history.get("summary"),
            )
        )
        inserted += 1
    return inserted


def seed() -> tuple[int, int]:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        source_count = seed_sources(db)
        temple_count = seed_temples(db)
        db.commit()
        return source_count, temple_count
    finally:
        db.close()


if __name__ == "__main__":
    sources, temples = seed()
    print(f"Inserted {sources} new source record(s) and {temples} new temple record(s).")
