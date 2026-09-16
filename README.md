# Guntur Heritage Atlas

A source-backed digital atlas of Guntur's temples, localities, people, events, architecture, and heritage routes.

## Project principles
- Evidence before claims: historical statements should point to a source.
- Separate documented facts from oral traditions and interpretations.
- Stable IDs for heritage entities so records can be connected over time.
- The database is the source of truth; the web UI consumes the API.
- Build one complete, verified temple record before scaling to the whole atlas.

## Architecture

```text
frontend/  ->  backend API  ->  PostgreSQL
                  |
                  +-> source/evidence records
                  +-> heritage relationships
                  +-> authentication for contributors/admins
```

## Repository layout

- `frontend/` - web map, search, temple and locality pages
- `backend/` - API, validation, authentication, database layer
- `data/` - structured heritage records and research imports
- `docs/` - architecture, data model, research methodology
- `scripts/` - data import/validation utilities
- `tests/` - automated tests

## Status

Foundation phase. The first production-quality entity will be a single temple record with traceable sources and coordinates. Unsourced placeholder data is never presented as historical fact.
