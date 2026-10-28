# CLAUDE.md — Lesson Studio

Read this first on every task. Then the spec for the milestone you're on.

## What this is
Lesson Studio: a studio that turns a teacher's notes, readings and voice memos into finished teaching material (narrated explainer videos and lecture decks), planned with them and grounded in their sources. A standalone concept product built to demonstrate product judgment; not affiliated with any company.

## Source of truth, in order
1. `specs/05-build-plan.md` — milestones, autonomy protocol, definition of green
2. `specs/01-product-brief.md` — what and why
3. `specs/02-domain-model.md` — every type (implement exactly)
4. `specs/03-agent-contracts.md` — agents, routes, architecture
5. `specs/04-seed-data.md` — demo content
6. The locked clickable mock (its artboard source files in `specs/mock/`) — what every screen looks like
If two of these disagree, the higher one wins. If something isn't covered, choose the simplest option that fits the brief's design principles, and note it in `docs/PROGRESS.md`.

## Stack
- TypeScript everywhere, `strict: true`. Node 22. npm workspaces (no pnpm/yarn).
- `apps/studio`: Next.js (App Router), React server components where natural, plain CSS modules with design tokens in `apps/studio/styles/tokens.css`. No UI kit.
- `apps/lab`: Next.js, internal only.
- `packages/schema` (zod), `packages/orchestrator`, `packages/agents`, `packages/models`, `packages/media`.
- Tests: Vitest. Persistence: behind `packages/schema/repo.ts` — `data/store.json` locally; on Vercel, one Redis key per workspace (an access code in live or guided mode), files in Vercel Blob (see build plan §1).
- Anthropic SDK for Claude; `openai` SDK pointed at an OpenAI-compatible base URL for open models; Runway SDK for media.

## Commands
- `npm run typecheck` · `npm test` · `npm run build` — all three must pass before any commit.
- `npm run seed:reset` — restore `data/` from `fixtures/seed/`.
- `npm run dev` — never in the foreground; run in the background and watch for "ready".

## Rules
- **Teacher-facing text** never mentions cost, credits, budgets, model names, or "scene". The unit is always a **slide**. Copy is plain, warm, and talks teaching, not production.
- **Light mode** for every UI. Match the mock's tokens: ground `#F6F7F9`, surface `#FFFFFF`, text `#1B1F27`, muted `#5A6272`, line `#E3E6EC`, accent `#3442C9` (hover `#26318F`), success `#0F766E`, warning bg `#FEF3C7` / text `#7C4A03`. Font: Plus Jakarta Sans. Touch targets ≥ 44px. Text contrast ≥ 4.5:1.
- **Accessibility:** real buttons and links, labels on inputs, `aria-label` on icon-only buttons, decorative SVG `aria-hidden`.
- **Agents** are called only by the orchestrator. Every LLM output is validated with zod. Every agent has a stub with the same output schema.
- **Paid calls** go only through `packages/models` and `packages/media`, which log AgentRun and CostEvent. Never call a provider SDK from anywhere else.
- **Access:** nothing but the Enter screen is reachable without a valid access code. One workspace per code.
- **Guided demo** makes zero live provider calls, whatever the environment. **Live mode** calls providers only through `packages/models` and `packages/media`, which check the spend gate before every call (Spec 03).
- **Spend messages** to visitors never show amounts or the words cost, credits or budget.
- **Secrets:** never read, print, commit or log API keys. Never create `.env` files with real values. Keys exist only in Vercel.
- **Content:** no copied text from books, articles or websites in fixtures or prompts. Write original content or reference by URL. Exception: openly licensed (CC BY) source files used only as eval inputs in `fixtures/golden/*/files/`, with attribution in `SOURCES.md`.
- **OpenStax:** openstax.org books are now CC BY-NC-SA and forbid loading them into LLMs or AI products without written permission. Never fetch openstax.org content into a model (intake, evals, suggested sources). Use CC BY 4.0 copies of earlier editions (LibreTexts, Lumen) or other sources.
- Keep files small and named for what they do. No dead code, no TODO comments left behind; put open items in `docs/PROGRESS.md`.

## Working style
- Follow the autonomy protocol in `specs/05-build-plan.md` §2: small milestones, green before commit, long commands in the background, stop after two failed attempts and log it.
- Update `docs/PROGRESS.md` at the end of every milestone.
