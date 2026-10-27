# Progress

One short entry per milestone. Newest first.

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

## Blocked
- Pushing to GitHub needs the Claude GitHub App installed on `AnkitaBhosle/lesson-studio`. Commits are made locally until then.
