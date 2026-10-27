# Lesson Studio · studio app

The teacher-facing app. See the repo root `CLAUDE.md` and `specs/` for everything else.

## Environment (Vercel)
- `DEMO_MODE=true`: no live model or media calls.
- `KV_REST_API_URL`, `KV_REST_API_TOKEN`: Redis (Upstash) for per-visitor demo state. Set automatically when the Upstash store is connected to the project.

Locally, demo state lives in `data/store.json`; `npm run seed:reset` restores it.
