# Architecture

## Goals

Guntur Heritage Atlas is designed as a public heritage information system with a separate research/data layer and a web presentation layer.

## Layers

1. **Data** - canonical structured records for temples, localities, people, events, sources and routes.
2. **Database** - PostgreSQL as the canonical application datastore.
3. **Backend** - REST API responsible for validation, search, relationships, authentication and authorization.
4. **Frontend** - map-first web application consuming the API.
5. **Research workflow** - source capture, evidence classification and review before publication.

## Authentication boundary

Public browsing should not require an account. Contributor and administrator operations require authentication and authorization. Passwords are never stored in plaintext. Secrets belong in environment variables or the deployment secret store, never in Git.

## Evidence boundary

A historical assertion should have one or more linked source records. The application should distinguish documented evidence, attributed oral tradition, interpretation, and unknown/unverified claims.

## Initial API shape

- `GET /api/v1/temples`
- `GET /api/v1/temples/{id}`
- `GET /api/v1/localities`
- `GET /api/v1/localities/{id}`
- `GET /api/v1/routes/{id}`
- `GET /api/v1/search?q=...`
- `POST /api/v1/auth/login` (protected system)
- contributor/admin write endpoints will be added after the public read model is stable.
