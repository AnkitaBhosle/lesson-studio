# Progress

One short entry per milestone. Newest first.

## Sealed golden set done (Oct 27)
- 57 cases by the separate eval agent; `golden:check` passes. 71% of extraction and planning cases use real public sources; revision and self-check plans are built on real sources; preference histories are synthetic.
- Schema now allows a clean self-check case (no planted problems), scored on false alarms only.
- **OpenStax license change** (verified on openstax.org): books are CC BY-NC-SA and may not be loaded into LLMs or AI products without written permission. Evals use CC BY 4.0 LibreTexts / Lumen copies instead; rule added to `CLAUDE.md`; guided seed note in Spec 04. Before M11 or any intake of the guided readings, switch those to CC BY copies.
- **Owner to fetch:** Psychology 2e, Chapter 8 Memory (LibreTexts, CC BY 4.0) PDF, used by two sealed cases: https://socialsci.libretexts.org/@api/deki/pages/76922/pdf/8%253A%2bMemory.pdf

## M4 · Access codes and modes
- Enter screen; the request proxy lets nothing through without a signed `ls_code` cookie (signed with `ACCESS_COOKIE_SECRET`); each request also checks the code is still active. Wrong codes are rate limited per IP.
- One workspace per code and mode in Redis: `live` starts empty (one teacher, Starters, curated Templates), `guided` starts as the Maya / Dr. Ortiz seed. "Try the guided demo" / "Back to my lessons" in the top bar; a banner marks the guided demo; Reset only touches the guided demo.
- Owner page at `/admin` (sign in with `ADMIN_TOKEN`): create codes (label, prefix, cap), turn them off and on, see first and last use. Moves into the Lab in M10. Locally the code `LOCAL` always works.
- Live mode starts from scratch: Home creates a real lesson (first one creates the course), Sources takes pasted text and links, "Plan the lesson" makes a first draft with the stub planner. Real planning is M5, reading links and files is M6.
- Walkthrough covers the Enter screen, a live lesson from scratch, and both guided flows. 27 unit tests.

## Golden set template (owner work in parallel)
- `fixtures/golden/`: README (how to write cases, targets, difficulty guide), `RUBRIC.md` (draft), `DECISION-RULE.md` (to fill in before the bakeoff), templates for the five tasks, and one original example case per task.
- `npm run golden:check` validates every case and prints coverage against targets (15 / 20 / 8 / 8 / 6); it also runs in `npm test`.
- Simplified: Claude writes all 57 cases from `CASES.md` (a one-line-per-case list the owner skims), the decision rule has defaults for the owner to approve, and calibration is the owner rating 15 blind outputs Good / OK / Bad (judge must agree on 12+). Owner time about 45 minutes.

## Scope change · live product by default (Oct 26)
- The shared link becomes the real product behind access codes: one code per recipient, one workspace per code, start from scratch with live planning and media. The seeded Maya / Dr. Ortiz flows become an optional guided demo from the top bar (zero live calls).
- Spending limits: $15 per code, $40 per day, $200 total for the site (warning at 75%, live generation pauses at 100% until raised in Lab). Media per lesson: images, diagrams, narration, up to 2 clips.
- Specs 01–05, `CLAUDE.md` and the architecture diagram updated. New milestone order M4–M13 in Spec 05 §3; `DEMO_MODE` retired.

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

- Upstash Redis connected. A prefetched link to `/switch` was silently changing the demo user; switch links are now plain anchors and the route ignores prefetches.
- `npm run walkthrough -- https://lesson-studio-murex.vercel.app` passes against the live site.

## Blocked
- Before M5: `ANTHROPIC_API_KEY`, `ADMIN_TOKEN` and `ACCESS_COOKIE_SECRET` in Vercel. Before M7: `RUNWAYML_API_SECRET` and a Vercel Blob store.
