import { randomUUID } from "node:crypto";
import type { ZodType } from "zod";
import type { AgentRun, Repo, Slide, Source, TeachingPlan } from "@ls/schema";
import {
  checkDraft, checkRevision, draftSchema, draftPrompt, reviseSchema, type DraftOut, type ReviseOut, factIndex, PLANNING_SYSTEM, revisePrompt,
  type PlanningContext, type SlideOut,
} from "@ls/agents";
import { callStructured, ROUTING, StructuredOutputError, type CallLog } from "@ls/models";
import { FlowError, getLessonContext } from "./lessons";
import { checkSpend, getLimits, PAUSED_MESSAGE, recordSpend, SpendPaused } from "./spend";

/** Real Planning (Spec 03 §2) for live workspaces: first drafts and revisions. */
const now = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
const CREDITS: Record<Slide["visualType"], number> = { generated_clip: 105, still_image: 8, diagram: 0, title_card: 0, source_excerpt: 0, teacher_upload: 0 };

async function contextFor(repo: Repo, lessonId: string): Promise<PlanningContext> {
  const ctx = getLessonContext(repo, lessonId);
  if (!ctx.template || !ctx.starter || !ctx.audience) throw new FlowError("This lesson is missing its setup");
  const limits = await getLimits();
  return {
    lesson: ctx.lesson, starter: ctx.starter, template: ctx.template, audience: ctx.audience, guidelines: ctx.guidelines,
    preferences: ctx.preferences.effective, knowledge: ctx.knowledge, sources: ctx.sources.filter((s: Source) => s.approvedForUse), clipsAllowed: limits.clipsPerLesson,
  };
}

function newRun(repo: Repo, lessonId: string): AgentRun {
  return repo.put("agentRuns", { id: newId("run"), createdAt: now(), updatedAt: now(), agent: "planning", lessonId, inputRef: `lesson:${lessonId}`, status: "running", steps: [],
    routing: { task: "planning", chosenModel: ROUTING.planning.model, reason: "fixed_config" } });
}

/**
 * Planning takes up to a couple of minutes, so it runs in the background: this records a running AgentRun
 * (saved with the request), and the work picks it up by id. The page polls `planningStatus`.
 */
export async function startPlanning(repo: Repo, lessonId: string, kind: "draft" | "revise", input?: { text: string }): Promise<string> {
  const c = await contextFor(repo, lessonId);
  const busy = latestRun(repo, lessonId);
  if (busy?.status === "running" && !stale(busy)) throw new FlowError("I'm already working on this plan");
  if (kind === "draft") {
    if (c.lesson.currentPlanId) throw new FlowError("This lesson already has a plan");
    if (!c.sources.some((s) => s.digest?.quotableFacts.length)) throw new FlowError("Add your notes first, so the plan is built from what you know");
    repo.put("lessons", { ...c.lesson, status: "planning", updatedAt: now() });
  } else {
    if (!c.lesson.currentPlanId) throw new FlowError("This lesson has no plan yet");
    if (c.lesson.status !== "plan_review") throw new FlowError("The plan can only be changed before it is approved");
    if (!input?.text.trim()) throw new FlowError("Tell me what to change");
  }
  return newRun(repo, lessonId).id;
}

const STALE_MS = 6 * 60_000;
const stale = (r: AgentRun) => Date.now() - Date.parse(r.updatedAt) > STALE_MS;
const latestRun = (repo: Repo, lessonId: string) =>
  repo.list("agentRuns", (r) => r.lessonId === lessonId && r.agent === "planning").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

export type PlanningStatus =
  | { state: "working" }
  | { state: "ready"; planId: string; summary?: string }
  | { state: "failed"; error: string; detail?: string };

/** What the page shows while it waits: still working, ready (with the plan), or a plain-language failure. */
export function planningStatus(repo: Repo, lessonId: string, runId: string): PlanningStatus {
  const run = repo.get("agentRuns", runId);
  if (!run || run.lessonId !== lessonId) throw new FlowError("Couldn't find that planning request", 404);
  if (run.status === "running") {
    if (!stale(run)) return { state: "working" };
    const lesson = repo.get("lessons", lessonId);
    if (lesson?.status === "planning") repo.put("lessons", { ...lesson, status: "sourcing", updatedAt: now() });
    repo.put("agentRuns", { ...run, status: "failed", error: "timed out", updatedAt: now() });
    return { state: "failed", error: "That took too long. Please try again.", detail: "timed out" };
  }
  if (run.status === "succeeded" && run.outputRef?.startsWith("plan:")) {
    const summary = run.steps.find((s) => s.kind === "handoff")?.detail;
    return { state: "ready", planId: run.outputRef.slice(5), summary };
  }
  const paused = run.error?.startsWith("paused:");
  return { state: "failed", error: paused ? PAUSED_MESSAGE : "I couldn't finish the plan. Try again, or shorten your notes.", detail: run.error };
}

/** One AgentRun per call, plus a CostEvent and spend counters for every paid model call. */
function runLogger(repo: Repo, lessonId: string, code: string, runId?: string) {
  const run: AgentRun = (runId && repo.get("agentRuns", runId)) || newRun(repo, lessonId);
  const log: CallLog = {
    step: (kind, detail) => run.steps.push({ at: now(), kind, detail }),
    cost: async (e) => {
      repo.put("costEvents", { id: newId("cst"), createdAt: now(), updatedAt: now(), lessonId, agentRunId: run.id, provider: "anthropic", operation: "llm", model: e.model,
        units: { inputTokens: e.inputTokens, outputTokens: e.outputTokens }, credits: Math.ceil(e.credits), cached: false, outcome: "kept", code });
      await recordSpend(code, e.credits);
    },
  };
  const finish = (status: AgentRun["status"], extra: Partial<AgentRun> = {}) => repo.put("agentRuns", { ...run, ...extra, status, updatedAt: now() });
  const handoff = (detail: string) => run.steps.push({ at: now(), kind: "handoff", detail });
  return { log, finish, handoff, gate: () => checkSpend(code) };
}

function toSlide(s: SlideOut, slideId: string, order: number, facts: ReturnType<typeof factIndex>, deck: boolean): Slide {
  const video = "narrative" in s ? s : undefined;
  const lecture = "bullets" in s ? s : undefined;
  return {
    slideId, order, role: s.role, section: deck ? lecture?.section : undefined, title: s.title,
    narrative: deck ? undefined : video?.narrative, estDurationSec: deck ? undefined : video?.estDurationSec,
    bullets: deck ? lecture?.bullets ?? [] : [], speakerNotes: deck ? lecture?.speakerNotes : undefined,
    layout: deck ? (s.role === "title" ? "title" : s.role === "question" ? "question" : s.visualType === "generated_clip" ? "clip" : "image_left") : undefined,
    visual: s.visual.replace(/\bscene\b/gi, "picture").replace(/\bscenes\b/gi, "pictures"), visualType: s.visualType, visualPrompt: s.visual, whyThisVisual: s.whyThisVisual,
    claims: s.claims.map((c) => ({
      text: c.text, status: c.status,
      citations: c.factIds.map((id) => { const f = facts.get(id)!; return { sourceId: f.sourceId, factId: id, locator: f.locator }; }),
    })),
    estCredits: CREDITS[s.visualType],
  };
}

function failed(e: unknown, finish: (s: AgentRun["status"], x?: Partial<AgentRun>) => unknown): never {
  if (e instanceof SpendPaused) { finish("failed", { error: `paused: ${e.reason}` }); throw new FlowError(e.message, 429); }
  console.error("[planning]", e instanceof Error ? `${e.name}: ${e.message}`.slice(0, 1000) : e);
  finish(e instanceof StructuredOutputError ? "needs_user" : "failed", { error: String(e).slice(0, 500) });
  throw new FlowError("I couldn't finish the plan. Try again, or shorten your notes.", 502, String(e).slice(0, 500));
}

export async function draftPlanLive(repo: Repo, lessonId: string, code: string, runId?: string): Promise<TeachingPlan> {
  const c = await contextFor(repo, lessonId);
  if (c.lesson.currentPlanId) return repo.get("plans", c.lesson.currentPlanId)!;
  if (!c.sources.some((s) => s.digest?.quotableFacts.length)) throw new FlowError("Add your notes first, so the plan is built from what you know");
  const { log, finish, gate } = runLogger(repo, lessonId, code, runId);
  repo.put("lessons", { ...c.lesson, status: "planning", updatedAt: now() });
  let out: DraftOut;
  try {
    out = (await callStructured({ task: "planning", system: PLANNING_SYSTEM, user: draftPrompt(c), schema: draftSchema(c.lesson.format === "lecture_deck") as unknown as ZodType<DraftOut>,
      gate, log, validate: (d) => checkDraft(d, c) })).value;
  } catch (e) {
    repo.put("lessons", { ...c.lesson, status: "sourcing", updatedAt: now() });
    failed(e, finish);
  }
  const facts = factIndex(c.sources);
  const deck = c.lesson.format === "lecture_deck";
  const planId = newId("pln");
  const sid = (i: number) => `sld_${planId.slice(4, 10)}_${i + 1}`;
  const angles = out.angles.map((a, i) => ({ angleId: `ang_${planId.slice(4, 10)}_${i + 1}`, label: a.label, story: a.story }));
  const t = now();
  const slides = out.slides.map((s, i) => toSlide(s, sid(i), i + 1, facts, deck));
  const plan = repo.put("plans", {
    id: planId, createdAt: t, updatedAt: t, lessonId, version: 1, format: c.lesson.format,
    story: out.story, chosenAngleId: angles[0]!.angleId, angles, learningObjectives: out.learningObjectives, assumptions: out.assumptions,
    recap: out.recap ? { fromLessonId: out.recap.fromLessonId, summary: out.recap.summary, decision: "pending",
      slides: out.recap.slides.map((s, i) => ({ ...toSlide(s, `${sid(i)}_recap`, 0, facts, deck), section: deck ? "Recap" : undefined, fromRecap: { lessonId: out.recap!.fromLessonId } })) } : undefined,
    slides,
    costEstimate: { totalCredits: slides.reduce((n, s) => n + s.estCredits, 0), byType: {}, llmCredits: 0, ttsCredits: 0, withinEnvelope: true, downgradesApplied: [] },
    guidelineChecks: out.guidelineChecks.filter((g) => c.guidelines.some((x) => x.id === g.guidelineId)),
    status: "awaiting_approval",
  });
  finish("succeeded", { outputRef: `plan:${plan.id}` });
  repo.put("lessons", { ...repo.get("lessons", lessonId)!, currentPlanId: plan.id, status: "plan_review", updatedAt: now() });
  return plan;
}

export async function revisePlanLive(repo: Repo, lessonId: string, code: string, input: { text: string; via: "typed" | "dictated"; slideId?: string }, runId?: string) {
  const c = await contextFor(repo, lessonId);
  const plan = c.lesson.currentPlanId ? repo.get("plans", c.lesson.currentPlanId) : undefined;
  if (!plan) throw new FlowError("This lesson has no plan yet");
  if (c.lesson.status !== "plan_review") throw new FlowError("The plan can only be changed before it is approved");
  if (!input.text.trim()) throw new FlowError("Tell me what to change");
  const { log, finish, handoff, gate } = runLogger(repo, lessonId, code, runId);
  let out: ReviseOut;
  try {
    out = (await callStructured({ task: "planning", system: PLANNING_SYSTEM, user: revisePrompt(c, plan, input.text, input.slideId), schema: reviseSchema(c.lesson.format === "lecture_deck") as unknown as ZodType<ReviseOut>,
      gate, log, validate: (r) => checkRevision(r, plan, c, input.slideId) })).value;
  } catch (e) {
    failed(e, finish);
  }
  const facts = factIndex(c.sources);
  const deck = c.lesson.format === "lecture_deck";
  const version = plan.version + 1;
  const reason = input.slideId ? ("slide_rewrite" as const) : ("plan_revision" as const);
  const changed = new Map(out.changes.map((x) => [x.slideId, x.slide]));
  const removed = new Set(out.removeSlideIds);
  const mark = (s: Slide): Slide => ({ ...s, changedInVersion: version, changeReason: reason });
  let slides: Slide[] = [];
  const inserts = (after: string | null) => out.insert.filter((x) => x.afterSlideId === after).map((x) => mark(toSlide(x.slide, newId("sld"), 0, facts, deck)));
  slides.push(...inserts(null));
  for (const s of plan.slides) {
    if (removed.has(s.slideId)) continue;
    const next = changed.get(s.slideId);
    // Untouched slides are carried over exactly as they were.
    slides.push(next ? mark(toSlide(next, s.slideId, s.order, facts, deck)) : s);
    slides.push(...inserts(s.slideId));
  }
  slides = slides.map((s, i) => (s.order === i + 1 ? s : { ...s, order: i + 1 }));
  repo.put("plans", { ...plan, status: "superseded", updatedAt: now() });
  const next = repo.put("plans", {
    ...plan, id: newId("pln"), version, parentPlanId: plan.id, createdAt: now(), updatedAt: now(), status: "awaiting_approval",
    revisionRequest: { text: input.text, via: input.via, scopeSlideId: input.slideId }, story: out.story || plan.story, slides,
  });
  const summary = `Draft ${version} is ready. ${out.summary} Your earlier draft is saved.`;
  handoff(summary);
  finish("succeeded", { outputRef: `plan:${next.id}` });
  repo.put("lessons", { ...repo.get("lessons", lessonId)!, currentPlanId: next.id, updatedAt: now() });
  return { plan: next, summary };
}

/** Live planning runs only in live mode with a model key configured; everything else uses the stub. */
export { liveModelsAvailable } from "@ls/models";

/** The background half of `startPlanning`. Never throws: the outcome is on the AgentRun for `planningStatus`. */
export async function runPlanning(repo: Repo, lessonId: string, code: string, runId: string, input?: { text: string; via: "typed" | "dictated"; slideId?: string }) {
  try {
    if (input) await revisePlanLive(repo, lessonId, code, input, runId);
    else await draftPlanLive(repo, lessonId, code, runId);
  } catch (e) {
    const run = repo.get("agentRuns", runId);
    if (run?.status === "running") repo.put("agentRuns", { ...run, status: "failed", error: String(e).slice(0, 500), updatedAt: now() });
    const lesson = repo.get("lessons", lessonId);
    if (!input && lesson?.status === "planning") repo.put("lessons", { ...lesson, status: "sourcing", updatedAt: now() });
  }
}
