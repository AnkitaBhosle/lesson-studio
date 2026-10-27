# Progress

One short entry per milestone. Newest first.

## M2 + M3 · Studio screens, orchestrator, routes and stub agents
- Built together to avoid wiring screens twice: every screen reads the repository and every action goes through an API route to the orchestrator.
- Orchestrator (`packages/orchestrator/src/lessons.ts`, `settings.ts`): plan drafts (every change makes a new draft and keeps the old one), story angles, recap, revise from a note (whole plan or one slide), flagged-claim gate before approval, preview slide ops (re-record, visual versions, uploads, choose a version, text edits in place), final with course-knowledge update, source visibility, suggested sources, sources card, preferences (teacher edits win; removed values are remembered), apps, schedules, guidelines. 22 unit tests.
- 23 API routes per Spec 03, plus `/switch?to=` (demo user) and `/reset` (restore the seed). `proxy.ts` gives each visitor an id cookie so Vercel visitors get their own copy.
- Screens: Home, Course (with course settings), Sources / Plan / Preview / Final for both formats, Templates, Settings. Placeholder visuals are drawn from each slide's description in the lesson's template colors until real media lands (M8).
- `npm run walkthrough` clicks through both hero flows in a browser against a running studio (Playwright, preinstalled in the build environment). Passes.
- Decisions: one shared stylesheet (`styles/ui.css`) instead of per-component CSS modules, since the mock uses one set of classes; clarifying-question chips on the Plan screen are local only (the domain model has no field for answers yet); "Start lesson" and "New lesson" open the in-progress hero lesson, because creating a lesson from scratch needs the real Planning agent (M4); adding new sources, brand templates and file downloads are shown but disabled or explained until their milestones.

## M1 · Schema, repository and seed
- Spec 02 implemented as zod in `packages/schema/src/schema.ts`, with inferred types. `z.record` keys use strings (zod 4 records over enums must list every key).
- Repository (`packages/schema/src/repo.ts`) validates every write. `packages/orchestrator/src/store.ts` picks the backend: `data/store.json` locally, a per-visitor in-memory copy on Vercel. `npm run seed:reset` restores the seed.
- Seed per Spec 04 lives in `fixtures/seed/*.ts` (typed TypeScript rather than raw JSON, so the compiler checks it); 10 tests cover validity, citations, draft diffs, visibility defaults and the "no scene" rule.
- Source URLs point at publisher landing pages; digests are our own wording.

## M0 · Scaffold
- npm workspaces monorepo: `apps/studio`, `apps/lab`, `packages/{schema,orchestrator,agents,models,media}`, `fixtures/`, `docs/`, `specs/`.
- TypeScript strict across the repo, Vitest at the root, Next.js App Router in both apps.
- Specs, diagrams and the locked mock's artboard files are in `specs/`.
- Decision: no ESLint for now. `tsc --noEmit` and `next build` cover type and build errors; a linter can be added later without changing code.

## Deploy
- Live at https://lesson-studio-murex.vercel.app (Vercel project `lesson-studio`, root `apps/studio`, `DEMO_MODE=true`).
- Vercel installs only the app's own dependencies, so `apps/studio` declares the `@ls/*` workspace packages, `zod` and `typescript` directly.
- Per-visitor in-memory state does not survive across serverless instances (walkthrough failed on the live site). Moved demo state to Redis via the Upstash REST API (`KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_*`), one key per visitor, one-week expiry. Without those variables it falls back to in-memory.

## Blocked
- Redis for the live demo: needs an Upstash Redis store connected to the Vercel project (owner action in the Vercel dashboard).
