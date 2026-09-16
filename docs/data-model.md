# Data Model

## Core entities

- `temples` - identity, location, deity, historical summary, architecture and publication state.
- `localities` - present and historical locality names, boundaries/coordinates and name-origin evidence.
- `people` - historically associated people with source-backed relationships.
- `historical_events` - dated or approximate events connected to places and people.
- `sources` - books, government records, surveys, inscriptions, archival documents, newspapers and oral-history interviews.
- `heritage_routes` - ordered stops forming a thematic or geographic journey.

## Evidence model

Each source has a stable ID. Claims reference sources rather than embedding citations as unstructured prose.

Evidence classifications:

- `documented` - supported directly by an identifiable source.
- `oral_tradition` - attributed local/community tradition.
- `interpretation` - reasoned interpretation that should identify its basis.
- `unverified` - recorded for research but not suitable for presentation as established fact.

## IDs

Use readable stable IDs such as `GHA-TEM-0001`, `GHA-LOC-0001`, `GHA-SRC-0001`.

## Temple JSON contract

```json
{
  "temple_id": "GHA-TEM-0001",
  "name": "",
  "alternate_names": [],
  "deity": "",
  "locality_id": "",
  "location": {"latitude": null, "longitude": null, "address": ""},
  "history": {"summary": "", "founding_period": "", "founder": "", "renovations": []},
  "name_origin": {"summary": "", "evidence": []},
  "architecture": {"style": "", "features": []},
  "festivals": [],
  "sources": [],
  "media": [],
  "status": "research"
}
```

Do not fill unknown fields with invented values. Use `null`, an empty list, or an explicit unknown status as appropriate.
