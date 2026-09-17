"""Seed the local SQLite database from repository research records."""

import json
from pathlib import Path

from sqlalchemy import select

from .database import SessionLocal, engine
from .models import Base, Locality, Source, Temple

ROOT = Path(__file__).resolve().parents[2]
TEMPLE_DIR = ROOT / "data" / "temples"
LOCALITY_DIR = ROOT / "data" / "localities"
SOURCE_DIR = ROOT / "data" / "sources"


def load_records(directory: Path) -> list[dict]:
    return [
        json.loads(path.read_text(encoding="utf-8"))
        for path in sorted(directory.glob("*.json"))
    ]


def seed_sources(db) -> int:
    inserted = 0
    for record in load_records(SOURCE_DIR):
        source_id = record["source_id"]
        source = db.scalar(select(Source).where(Source.source_id == source_id))
        if source is None:
            source = Source(
                source_id=source_id,
                title=record["title"],
                publisher=record.get("publisher"),
                url=record.get("url"),
                source_type=record.get("source_type"),
                reliability=record.get("reliability"),
            )
            db.add(source)
            inserted += 1
    db.flush()
    return inserted


def seed_localities(db) -> int:
    inserted = 0
    for record in load_records(LOCALITY_DIR):
        locality_id = record["locality_id"]
        locality = db.scalar(select(Locality).where(Locality.locality_id == locality_id))
        if locality is None:
            locality = Locality(locality_id=locality_id, name=record["name"])
            db.add(locality)
            inserted += 1

        admin = record.get("administrative_context") or {}
        locality.name = record["name"]
        locality.locality_type = record.get("type")
        locality.current_district = admin.get("current_district")
        locality.state = admin.get("state")
        locality.country = admin.get("country")
        locality.name_origin_summary = (record.get("name_origin") or {}).get("summary")
        locality.history_summary = (record.get("history") or {}).get("summary")
        locality.evidence_status = record.get("status", "needs-review")

        source_ids = set(record.get("sources") or [])
        for claim in (record.get("name_origin") or {}).get("claims", []):
            if claim.get("source_id"):
                source_ids.add(claim["source_id"])
        for source_id in source_ids:
            source = db.scalar(select(Source).where(Source.source_id == source_id))
            if source and source not in locality.sources:
                locality.sources.append(source)

    db.flush()
    return inserted


def seed_temples(db) -> int:
    inserted = 0
    for record in load_records(TEMPLE_DIR):
        temple_id = record["temple_id"]
        temple = db.scalar(select(Temple).where(Temple.temple_id == temple_id))
        if temple is None:
            temple = Temple(temple_id=temple_id, name=record["name"])
            db.add(temple)
            inserted += 1

        locality_id = record.get("locality_id")
        if locality_id:
            locality = db.scalar(select(Locality).where(Locality.locality_id == locality_id))
            if locality is not None:
                temple.locality = locality

        location = record.get("location") or {}
        history = record.get("history") or {}
        temple.name = record["name"]
        temple.deity = record.get("deity")
        temple.latitude = location.get("latitude")
        temple.longitude = location.get("longitude")
        temple.description = history.get("summary")
        temple.evidence_status = record.get("status", "needs-review")

        for source_record in record.get("sources", []):
            source_id = source_record.get("source_id") if isinstance(source_record, dict) else source_record
            source = db.scalar(select(Source).where(Source.source_id == source_id))
            if source and source not in temple.sources:
                temple.sources.append(source)

    db.flush()
    return inserted


def seed() -> tuple[int, int, int]:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        source_count = seed_sources(db)
        locality_count = seed_localities(db)
        temple_count = seed_temples(db)
        db.commit()
        return source_count, locality_count, temple_count
    finally:
        db.close()


if __name__ == "__main__":
    sources, localities, temples = seed()
    print(
        f"Inserted {sources} source(s), {localities} locality record(s), "
        f"and {temples} temple record(s)."
    )
