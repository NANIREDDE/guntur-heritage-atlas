"""Seed the local SQLite database from the repository's research records."""

import json
from pathlib import Path

from sqlalchemy import select

from .database import SessionLocal, engine
from .models import Base, Temple


ROOT = Path(__file__).resolve().parents[2]
TEMPLE_DIR = ROOT / "data" / "temples"


def seed_temples() -> int:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    inserted = 0
    try:
        for path in sorted(TEMPLE_DIR.glob("*.json")):
            if path.name.startswith("README"):
                continue

            record = json.loads(path.read_text(encoding="utf-8"))
            temple_id = record["temple_id"]
            existing = db.scalar(
                select(Temple).where(Temple.temple_id == temple_id)
            )
            if existing:
                continue

            location = record.get("location") or {}
            history = record.get("history") or {}
            temple = Temple(
                temple_id=temple_id,
                name=record["name"],
                deity=record.get("deity"),
                locality=record.get("locality_id"),
                latitude=location.get("latitude"),
                longitude=location.get("longitude"),
                description=history.get("summary"),
            )
            db.add(temple)
            inserted += 1

        db.commit()
        return inserted
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Inserted {seed_temples()} new temple record(s).")
