# Spec 05 — Build Plan and Autonomy Protocol

> How Lesson Studio gets built with minimal supervision. Read with `CLAUDE.md` (conventions) and Specs 01–04. The locked clickable mock is the visual reference for every screen.

## 1. Where things run

| Place | Used for |
|---|---|
| Claude's cloud workspace | Writing code, installing packages, type checks, unit tests, production builds, local smoke tests in demo mode |
| GitHub repo (`lesson-studio`, public) | Source of truth. One branch per milestone, merged to `main` when green |
| Vercel | Preview deploy on every push, production deploy from `main`. The shared demo link. **API keys live only here**, as encrypted environment variables the teacher-owner enters herself |

**Persistence on Vercel:** the serverless filesystem is read-only, so the repository has two modes. Locally it reads and writes JSON files in `data/`. On Vercel it reads the seed as a read-only base and keeps each visitor's changes in a server-side in-memory overlay keyed by a visitor cookie, with a **Reset demo** action. Changes can disappear on a cold start, which is fine for a demo; a durable store is a later decision.

The workspace never holds API keys. Anything that needs a live model or media call (building the demo cache, live mode) runs on Vercel through a protected admin route.

## 2. Autonomy protocol (how the builder avoids stalls, timeouts and drift)
1. **Small milestones.** Each milestone below is sized to finish in one sitting and ends with a green check. Never start the next one with the current one red.
2. **The definition of green** for every milestone: `npm run typecheck`, `npm test`, `npm run build` all pass, plus the milestone's own acceptance checks. Then commit, push, and confirm the Vercel preview build succeeds (read its build logs if it fails).
3. **No long foreground commands.** Anything that may take more than ~2 minutes (installs, builds, dev server, test suites) runs in the background with a completion watch, never as a blocking call. Never run interactive commands. Never run a dev server in the foreground.
4. **Install once.** Dependencies are added in M0 and M1 where possible. Lockfile committed. No global installs.
5. **Stubs before real.** Every agent and the media client have a stub that returns schema-valid fixtures. The UI is complete on stubs before any real model call exists, so a failing provider never blocks UI work.
6. **When blocked, don't spin.** After two failed attempts at the same problem, write it to `docs/PROGRESS.md` under **Blocked** with what was tried, switch to the next milestone that doesn't depend on it, and tell the owner in one line.
7. **Progress is visible.** `docs/PROGRESS.md` gets one short entry per milestone: done, preview link, what's mocked, open issues. The owner reads this, not the commit log.
8. **Decisions that need the owner** (anything irreversible, costs money, or contradicts the specs) stop and ask. Everything else follows the specs and the mock without asking.
9. **Commits:** one per green step, message `M<n>: <what>`. Never commit secrets, `.env*` files or the demo cache's raw provider responses that include keys or signed URLs.

## 3. Milestones

| # | Milestone | Acceptance checks |
|---|---|---|
| M0 | **Scaffold.** npm workspaces monorepo: `apps/studio` (Next.js, App Router, TypeScript strict), `apps/lab`, `packages/{schema,orchestrator,agents,models,media}`, `fixtures/`, `docs/`. ESLint, Vitest, shared tsconfig. `CLAUDE.md`, specs copied into `specs/`. | Green definition; empty studio page deploys on Vercel |
| M1 | **Schema + repository + seed.** Spec 02 as zod in `packages/schema`; JSON-file repository with read/write and a reset-to-seed command; seed data per Spec 04. | Every seed file validates against its schema in a test; reset command restores seed |
| M2 | **Studio screens on seed data.** All 13 mock screens (minus Lab) built as real pages reading from the repository: Home, Course view with Course settings, Lesson studio (Sources, Plan, Preview, Final) for both heroes, Templates, Settings. Design tokens taken from the mock. | Each route renders; layout, copy and states match the mock artboards in `specs/mock/` |
| M3 | **Orchestrator + stub agents.** State machine (Spec 02 §4), every route in Spec 03, stub agents, preference resolution, plan versions, polling endpoint. Both hero flows click through end to end in demo mode, including revise, angles, recap, re-record, visual versions, sources card. | API tests per route; a scripted walk-through of both flows passes against stubs. **First shareable demo link.** |
| M4 | **Model layer + real Planning.** `packages/models` with Anthropic and OpenAI-compatible providers, routing config, repair and escalation, AgentRun logging. Real Planning in draft, revise and angles modes, behind `ALLOW_LIVE_LLM`. | Schema-valid output on both heroes' seed inputs via the admin route on Vercel; revision changes only targeted slides |
| M5 | **Real Source Intake.** Text, PDF and URL extraction, digests, cite/private defaults, gap detection. Transcription stays a fixture. | Seed sources produce digests with locators for every fact |
| M6 | **Creation: deck.** Slides rendered with templates, citation footers, speaker notes; image generation through the media client; visual versions and uploads; PDF export via print stylesheet. | Dr. Ortiz's deck renders and exports; new visual version keeps old versions |
| M7 | **Creation: explainer.** Narration via TTS with per-slide re-record, preview player from a manifest, captions, sources card from cited sources only, thumbnail. | Maya's explainer plays in the browser; re-recording slide 3 changes only slide 3 |
| M8 | **Media client + demo cache.** Provider interface, gate and envelope checks, cache by request hash, CostEvent logging. Protected admin route on Vercel that generates the demo cache for both hero lessons and stores it (Vercel Blob). | Demo link plays both lessons with zero live calls; ledger shows original credits for cached items |
| M9 | **Lab app.** Spend, ledger, downgrades, evals runner on the golden set, release check, bakeoff view and routing log (sample data until M11). | Release check runs on the planning prompt and reports pass/fail |
| M10 | **Polish + demo.** Empty and error states, loading states, accessibility pass, demo script in `docs/DEMO.md`, recording checklist. | Owner walks the demo link without help |
| M11 | Model bakeoff (Spec 03 §5). | BakeoffResult per task; routing config updated |
| M12 | Router, only if M11 recommends it. | Routing log shows decisions; evals unchanged or better |

M0–M3 give a complete, shareable demo on stubs. M4–M8 make it real. M9–M12 are the depth story for interviews.

## 4. Owner checkpoints
- **After M3:** click through the demo link; confirm it matches the mock.
- **Before M4:** Anthropic and Runway keys added in Vercel (see §5).
- **Before M8's cache run:** confirm the spend (estimated ~$10 of Runway API credit, plus a few dollars of LLM).
- **After M10:** record the walkthrough.

## 5. Environment variables (set in Vercel by the owner, never in the repo or chat)
| Name | Where | Value |
|---|---|---|
| `DEMO_MODE` | Production + Preview | `true` |
| `ALLOW_LIVE_LLM` | Preview only | `true` when testing real agents |
| `ANTHROPIC_API_KEY` | Preview (and Production later) | from console.anthropic.com |
| `RUNWAYML_API_SECRET` | Preview only | from the Runway developer portal |
| `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY` | Preview only, M11 | an open-model host, for the bakeoff |
| `ADMIN_TOKEN` | Preview | any long random string; protects admin routes |
| `BLOB_READ_WRITE_TOKEN` | auto | created when Vercel Blob is added to the project |
