# Medical Platform

Next.js (web) + Nx monorepo, reading live **FHIR R4** data from a local
**HAPI FHIR** server (Docker) during Phase 1 OSCAR-integration testing.

## Prerequisites
- [Bun](https://bun.sh) (package manager / runner)
- [Docker](https://www.docker.com/) (runs HAPI FHIR + PostgreSQL)
- Python 3 (only to run the one-time seed script)

## First-time setup

```bash
# 1) Install dependencies
bun install

# 2) Configure the web app's data source (FHIR)
cp apps/web/.env.example apps/web/.env.local

# 3) Start the FHIR server (HAPI) + database (PostgreSQL)
docker compose -f docs/oscar/docker-compose.yml up -d

# 4) Wait ~30s for HAPI to be ready, then load the sample data (one time)
python docs/oscar/seed.py

# 5) Run the web app
bun run dev
```

Open the app and sign in with the demo patient:

- **Phone:** `+1 416 555 0101`  (pre-filled)
- **Code:** `123456`  (dev OTP, pre-filled)

## Day-to-day

The FHIR data lives in a Docker volume (PostgreSQL), so it survives restarts.

```bash
docker compose -f docs/oscar/docker-compose.yml up -d   # start everything
bun run dev                                             # run the app
```

You only need to re-run `python docs/oscar/seed.py` if you wiped the volume
(`docker compose ... down -v`) or you're setting up on a new machine.

## Useful

| What | Command |
|------|---------|
| Stop containers (keep data) | `docker compose -f docs/oscar/docker-compose.yml down` |
| Stop + delete data | `docker compose -f docs/oscar/docker-compose.yml down -v` |
| Reseed sample data | `python docs/oscar/seed.py` |
| FHIR base URL | http://localhost:8080/fhir |
| Which FHIR endpoints the app uses | [docs/oscar/FHIR_ENDPOINTS_IN_USE.md](docs/oscar/FHIR_ENDPOINTS_IN_USE.md) |
| OSCAR phased strategy | [docs/OSCAR_SETUP_OPTIONS.md](docs/OSCAR_SETUP_OPTIONS.md) |

## Use sample data without Docker

Don't want to run Docker? Set `DATA_SOURCE=mock` in `apps/web/.env.local` to use
built-in in-memory sample data instead of the FHIR server.
