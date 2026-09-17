# Guntur Heritage Atlas — Project Roadmap

## Goal
Build a source-backed heritage atlas for Guntur that connects temples, localities, historical observations, architecture, festivals, sources, media and modern heritage routes.

## Rules

1. Public temple profiles show an address, not latitude/longitude. Coordinates may remain internal map-reference data.
2. Verify current addresses against public map/business references and corroborate identity/history with government, temple, archaeological, archival or academic sources where available.
3. Never invent a street address or doorway coordinate.
4. Keep documented facts separate from traditional claims and interpretation.
5. Use `partial-verification` or `needs-review` when evidence is incomplete.
6. A modern suggested route must not be presented as a historically documented travel sequence unless sources establish that sequence.
7. Every reusable photograph needs a source URL and credit/license review before redistribution.

## Delivery sequence

### 1. Research database
- Expand the temple set from the initial five records.
- Add locality records and stable IDs.
- Add source metadata and evidence relationships.
- Connect modern records to the 1961 Guntur Taluk historical index when identity can be supported.

### 2. Quality gates
- Validate JSON syntax and stable IDs.
- Validate evidence statuses.
- Validate public addresses.
- Validate coordinate ranges for internal map data.
- Validate source and media URLs.
- Reject references to unknown localities or sources.

### 3. API
- Keep `/api/temples`, `/api/localities`, `/api/routes`, `/api/historical-observations`, and `/api/stats` stable.
- Add filtering/search without moving research logic into the frontend.
- Keep the database seeded from the research files so the files remain reviewable source-of-truth artifacts.

### 4. Web atlas
- Search by temple, locality and address.
- Show address in temple profiles.
- Keep coordinates out of the public profile panel.
- Retain the interactive map as a spatial overview.
- Show evidence status and source list on record details.
- Preserve historical and route views.

### 5. Route layer
- Build routes only from records with usable addresses and internal map references.
- Label routes as modern planning routes unless historical sequencing is documented.
- Add clustered routes for Guntur city, Mangalagiri/Undavalli/Pedakakani, and Ponnur as the evidence base grows.

### 6. Release readiness
- Run data validation and frontend/backend tests.
- Run a local smoke test for API and UI.
- Review all `verified` records.
- Keep unresolved records visibly marked.
- Review media licensing/attribution.
- Review README and setup instructions.
- Merge to `main` only after human review.

## Current evidence direction

The Guntur District government portal currently identifies Mangalagiri, Ponnur and Pedakakani as prominent temple locations and identifies Undavalli caves and Kondaveedu Fort as historically prominent locations. The district portal also currently highlights the Chathurmukha Brahma Lingeswara Swamy Temple at Chebrolu. These are research leads, not automatic publication as verified temple records.
