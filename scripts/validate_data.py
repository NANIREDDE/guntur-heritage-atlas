#!/usr/bin/env python3
"""Validate research JSON before it enters the atlas."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
STATUSES = {"verified", "partial-verification", "traditional-claim", "needs-review"}
ID_PATTERNS = {
    "temple_id": re.compile(r"^GHA-TEM-\d{4}$"),
    "locality_id": re.compile(r"^GHA-LOC-\d{4}$"),
    "source_id": re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$"),
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def valid_url(value: str) -> bool:
    p = urlparse(value)
    return p.scheme in {"http", "https"} and bool(p.netloc)


def main() -> int:
    errors: list[str] = []
    source_ids: set[str] = set()
    locality_ids: set[str] = set()
    temple_ids: set[str] = set()

    for path in sorted((DATA / "sources").glob("*.json")):
        try:
            record = load(path)
            sid = record.get("source_id") or record.get("id")
            if not sid or not ID_PATTERNS["source_id"].match(sid):
                errors.append(f"{path}: invalid or missing source_id")
            elif sid in source_ids:
                errors.append(f"{path}: duplicate source_id {sid}")
            else:
                source_ids.add(sid)
            if record.get("url") and not valid_url(record["url"]):
                errors.append(f"{path}: invalid source URL")
        except Exception as exc:
            errors.append(f"{path}: invalid JSON: {exc}")

    for path in sorted((DATA / "localities").glob("*.json")):
        try:
            record = load(path)
            lid = record.get("locality_id")
            if not lid or not ID_PATTERNS["locality_id"].match(lid):
                errors.append(f"{path}: invalid or missing locality_id")
            elif lid in locality_ids:
                errors.append(f"{path}: duplicate locality_id {lid}")
            else:
                locality_ids.add(lid)
            if record.get("status") not in STATUSES:
                errors.append(f"{path}: invalid status {record.get('status')!r}")
        except Exception as exc:
            errors.append(f"{path}: invalid JSON: {exc}")

    for path in sorted((DATA / "temples").glob("*.json")):
        try:
            record = load(path)
            tid = record.get("temple_id")
            if not tid or not ID_PATTERNS["temple_id"].match(tid):
                errors.append(f"{path}: invalid or missing temple_id")
            elif tid in temple_ids:
                errors.append(f"{path}: duplicate temple_id {tid}")
            else:
                temple_ids.add(tid)
            if record.get("status") not in STATUSES:
                errors.append(f"{path}: invalid status {record.get('status')!r}")
            location = record.get("location", {})
            if not location.get("address"):
                errors.append(f"{path}: missing public address")
            lat, lon = location.get("latitude"), location.get("longitude")
            if lat is not None and not -90 <= lat <= 90:
                errors.append(f"{path}: latitude out of range")
            if lon is not None and not -180 <= lon <= 180:
                errors.append(f"{path}: longitude out of range")
            if record.get("locality_id") and record["locality_id"] not in locality_ids:
                errors.append(f"{path}: unknown locality_id {record['locality_id']}")
            for source in record.get("sources", []):
                sid = source.get("source_id")
                if sid and sid not in source_ids:
                    errors.append(f"{path}: unknown source_id {sid}")
                if source.get("url") and not valid_url(source["url"]):
                    errors.append(f"{path}: invalid source URL")
            for media in record.get("media", []):
                for key in ("url", "source_url"):
                    if media.get(key) and not valid_url(media[key]):
                        errors.append(f"{path}: invalid media {key}")
        except Exception as exc:
            errors.append(f"{path}: invalid JSON: {exc}")

    if errors:
        print("DATA VALIDATION FAILED")
        print("\n".join(f"- {e}" for e in errors))
        return 1
    print(f"DATA VALIDATION PASSED: {len(temple_ids)} temples, {len(locality_ids)} localities, {len(source_ids)} sources")
    return 0


if __name__ == "__main__":
    sys.exit(main())
