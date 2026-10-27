# Spec 05 — Build Plan and Autonomy Protocol

> How Lesson Studio gets built with minimal supervision. Read with `CLAUDE.md` (conventions) and Specs 01–04. The locked clickable mock is the visual reference for every screen.

## 1. Where things run

| Place | Used for |
|---|---|
| Claude's cloud workspace | Writing code, installing packages, type checks, unit tests, production builds, local smoke tests on stubs and the guided demo |
| GitHub repo (`lesson-studio`, public) | Source of truth. One branch per milestone, merged to `main` when green |
| Vercel | Preview deploy on every push, production deploy from `main`. The shared demo link. **API keys live only here**, as encrypted environment variables the teacher-owner enters herself |

**Persistence on Vercel:** the serverless filesystem is read-only and requests land on many instances, so state lives in **Redis (Upstash)**: one key per workspace for live mode (`ls:live:<code>`) and one for the guided demo (`ls:guided:<code>`), plus access codes, limits and spend counters. Uploaded files and generated media live in **Vercel Blob** (provider URLs expire, so outputs are copied there). Locally the repository reads and writes `data/store.json`.

The build workspace never holds API keys. Anything that needs a live model or media call runs on Vercel.

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
10. **Spend-safe testing.** Tests never call paid providers. Live checks on Vercel use a dedicated test code with a small cap, and are listed in `docs/PROGRESS.md` with what they cost.

## 3. Milestones

| # | Milestone | Acceptance checks |
|---|---|---|
| M0 | **Scaffold.** npm workspaces monorepo: `apps/studio` (Next.js, App Router, TypeScript strict), `apps/lab`, `packages/{schema,orchestrator,agents,models,media}`, `fixtures/`, `docs/`. ESLint, Vitest, shared tsconfig. `CLAUDE.md`, specs copied into `specs/`. | Green definition; empty studio page deploys on Vercel |
| M1 | **Schema + repository + seed.** Spec 02 as zod in `packages/schema`; JSON-file repository with read/write and a reset-to-seed command; seed data per Spec 04. | Every seed file validates against its schema in a test; reset command restores seed |
| M2 | **Studio screens on seed data.** All 13 mock screens (minus Lab) built as real pages reading from the repository: Home, Course view with Course settings, Lesson studio (Sources, Plan, Preview, Final) for both heroes, Templates, Settings. Design tokens taken from the mock. | Each route renders; layout, copy and states match the mock artboards in `specs/mock/` |
| M3 | **Orchestrator + stub agents.** State machine (Spec 02 §4), every route in Spec 03, stub agents, preference resolution, plan versions, polling endpoint. Both hero flows click through end to end in demo mode, including revise, angles, recap, re-record, visual versions, sources card. | API tests per route; a scripted walk-through of both flows passes against stubs. **First shareable demo link.** |
| M4 | **Access codes + modes.** Enter screen; signed `ls_code` cookie; proxy blocks everything without a valid code; one Redis workspace per code for live mode and a separate seeded one for the guided demo; "Try the guided demo" / "Back to my lessons" in the top bar; owner-only admin routes to create, label and revoke codes (UI comes in Lab, M10). | Invalid code can't reach any page or API; two codes see different workspaces; same code on two browsers sees the same lessons; guided demo walkthrough still passes |
| M5 | **Model layer + real Planning + start from scratch.** `packages/models` (Anthropic and OpenAI-compatible providers, routing config, repair and escalation, AgentRun and CostEvent logging, spend gate). Home topic box and Starter cards create a lesson (first course created on first lesson); real Planning in draft, revise, single-slide and angles modes; clarifying questions answered from the Plan screen. | A new topic with pasted notes produces a schema-valid plan on Vercel; revision changes only targeted slides; spend counters move |
| M6 | **Real Source Intake.** Paste text, URL fetch, PDF/TXT/MD upload to Blob; digests with locators, cite/private defaults, gap detection; voice memo hidden in live mode. | Each source type produces a digest with locators for every fact; a gap is surfaced |
| M7 | **Media client + spend gates + background jobs.** Provider interface over Runway; per-code, daily and total caps checked before every paid call; pause at the total with the plain message and guided-demo offer; async tasks started on approve, advanced by polling, failed slides retried one at a time; outputs copied to Blob; max 2 clips per lesson. | A lesson's preview generates end to end on Vercel; hitting a test cap pauses cleanly; a failed slide doesn't block the rest |
| M8 | **Creation: deck.** Slides rendered with templates, citation footers, speaker notes; images through the media client; visual versions and uploads; PDF (print stylesheet) and PPTX export. | A live deck renders and exports both ways; new visual version keeps old versions |
| M9 | **Creation: explainer.** Narration via TTS with per-slide re-record, in-browser player from a manifest, captions, sources card from cited sources only, thumbnail. | A live explainer plays in the browser; re-recording slide 3 changes only slide 3 |
| M10 | **Lab app.** Codes (create, label, per-code cap, revoke), usage per code (lessons, furthest stage, spend), site spend vs daily and total limits with pause/resume and the 75% warning, ledger, evals runner on the golden set, release check. Protected by `ADMIN_TOKEN`. | Owner creates a code and sees its usage; raising the total resumes live mode |
| M11 | **Guided demo cache + polish.** Generate real media once for both hero lessons into Blob so the guided demo plays real visuals and narration with zero live calls; empty, loading and error states; accessibility pass; `docs/DEMO.md`. | Guided demo plays both lessons with zero live calls; owner walks the link without help |
| M12 | Model bakeoff (Spec 03 §5). | BakeoffResult per task; routing config updated |
| M13 | Router, only if M12 recommends it. | Routing log shows decisions; evals unchanged or better |

M0–M3 give a complete, shareable demo on stubs (done). M4–M9 make the shared link the real product behind access codes. M10–M11 make it safe and polished to hand out. M12–M13 are the depth story for interviews.

## 4. Owner checkpoints
- **After M3 (done):** demo link live and verified.
- **Before M5:** `ANTHROPIC_API_KEY` and `ADMIN_TOKEN` added in Vercel; an Anthropic monthly limit set in its console.
- **Before M7:** `RUNWAYML_API_SECRET` added; Runway credits bought; a Vercel Blob store connected; hard limits in both provider consoles a little above the site total.
- **Before handing out codes (after M10):** create one code per recipient in Lab.
- **After M11:** record the walkthrough.

## 5. Spending limits (owner-set in Lab; starting values)
| Limit | Value | What happens |
|---|---|---|
| Per access code | $15 | That code's live generation pauses; the visitor is offered the guided demo |
| Per day, whole site | $40 | Live generation pauses until the next day (UTC) |
| Total, whole site | $200 | Warning in Lab at 75%; at 100% live generation pauses for everyone until the owner raises it |
| Media per lesson | images, diagrams, narration, up to 2 clips | Extra clips fall back to stills |

## 6. Environment variables (set in Vercel by the owner, never in the repo or chat)
| Name | Where | Value |
|---|---|---|
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | auto | created when the Upstash Redis store is connected (done) |
| `ADMIN_TOKEN` | Production + Preview | any long random string; protects Lab and admin routes |
| `ACCESS_COOKIE_SECRET` | Production + Preview | any long random string; signs the access-code cookie |
| `ANTHROPIC_API_KEY` | Production + Preview | from console.anthropic.com |
| `RUNWAYML_API_SECRET` | Production + Preview | from the Runway developer portal |
| `LIVE_ENABLED` | Production + Preview | `true`; set to `false` to switch off all live generation at once |
| `BLOB_READ_WRITE_TOKEN` | auto | created when Vercel Blob is connected |
| `OPENAI_COMPAT_BASE_URL`, `OPENAI_COMPAT_API_KEY` | Preview only, M12 | an open-model host, for the bakeoff |

`DEMO_MODE` is retired: the guided demo is a mode inside the app, not a deployment setting.
