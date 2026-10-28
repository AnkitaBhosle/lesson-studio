import { beforeEach, describe, expect, it, vi } from "vitest";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { cloneStore, createRepo } from "@ls/schema";
import { liveSeed } from "@ls/fixtures";
import type { DraftOut, ReviseOut, SlideOut } from "@ls/agents";

// The model layer is replaced: these tests check what the orchestrator does with answers, not the model.
const answers: unknown[] = [];
vi.mock("@ls/models", () => ({
  ROUTING: { planning: { model: "test-model", maxTokens: 1000 } },
  StructuredOutputError: class extends Error {},
  liveModelsAvailable: () => true,
  callStructured: async (args: { gate: () => Promise<void>; log: { cost: (e: object) => Promise<void>; step: (k: string, d: string) => void }; validate?: (v: unknown) => string | null }) => {
    await args.gate();
    await args.log.cost({ model: "test-model", inputTokens: 1000, outputTokens: 500, credits: 0.7 });
    const value = answers.shift();
    const problem = args.validate?.(value);
    if (problem) throw new Error(`invalid: ${problem}`);
    return { value, model: "test-model" };
  },
}));

const { addSource, createLesson } = await import("./create");
const { draftPlanLive, planningStatus, revisePlanLive, runPlanning, startPlanning } = await import("./planning");
const { getSpend } = await import("./spend");

const NOTES = "Hand hygiene stops infections spreading in hospital wards every day. Use alcohol rub unless hands look dirty, then wash with soap. Rub for twenty to thirty seconds until your hands are dry.";
const slide = (title: string, factIds: string[], extra: Partial<SlideOut> = {}): SlideOut => ({
  role: "concept", title, narrative: `About ${title}.`, estDurationSec: 20, visual: "A diagram", visualType: "diagram", whyThisVisual: "clear",
  claims: factIds.length ? [{ text: title, factIds, status: "grounded" }] : [], ...extra,
});

function setup() {
  process.env.LS_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "ls-"));
  const repo = createRepo(cloneStore(liveSeed));
  const lesson = createLesson(repo, "usr_you", { topic: "Hand hygiene" });
  const src = addSource(repo, lesson.id, { kind: "text", text: NOTES });
  const f = src.digest!.quotableFacts.map((x) => x.factId);
  return { repo, lesson, f };
}

describe("real planning (orchestrator side)", () => {
  beforeEach(() => { answers.length = 0; });

  it("turns a draft into Draft 1 with citations, logs the run and the spend", async () => {
    const { repo, lesson, f } = setup();
    const draft: DraftOut = {
      story: "Start with a question.", angles: [{ label: "A", story: "a" }, { label: "B", story: "b" }, { label: "C", story: "c" }],
      learningObjectives: ["Clean hands correctly"], assumptions: ["this is for new students"], guidelineChecks: [], recap: null,
      slides: [slide("Why it matters", [f[0]!], { role: "hook" }), slide("Rub or wash", [f[1]!]), slide("How long", [f[2]!])],
    };
    answers.push(draft);
    const plan = await draftPlanLive(repo, lesson.id, "LOCAL");
    expect(plan.version).toBe(1);
    expect(plan.slides[1]!.claims[0]!.citations[0]!.factId).toBe(f[1]);
    expect(repo.get("lessons", lesson.id)?.status).toBe("plan_review");
    expect(repo.list("agentRuns")[0]?.status).toBe("succeeded");
    expect(repo.list("costEvents")[0]?.code).toBe("LOCAL");
    expect((await getSpend("LOCAL")).code).toBeCloseTo(0.7);
  });

  it("rejects an answer that cites a fact that doesn't exist", async () => {
    const { repo, lesson } = setup();
    answers.push({ story: "s", angles: [{ label: "A", story: "a" }, { label: "B", story: "b" }, { label: "C", story: "c" }], learningObjectives: ["x"], assumptions: [], guidelineChecks: [], recap: null,
      slides: [slide("One", ["made_up"]), slide("Two", [])] });
    await expect(draftPlanLive(repo, lesson.id, "LOCAL")).rejects.toThrow(/couldn't finish the plan/);
    expect(repo.get("lessons", lesson.id)?.status).toBe("sourcing");
  });

  it("a revision changes only the slides it names; the rest are carried over exactly", async () => {
    const { repo, lesson, f } = setup();
    answers.push({ story: "s", angles: [{ label: "A", story: "a" }, { label: "B", story: "b" }, { label: "C", story: "c" }], learningObjectives: ["x"], assumptions: [], guidelineChecks: [], recap: null,
      slides: [slide("One", [f[0]!]), slide("Two", [f[1]!]), slide("Three", [f[2]!])] });
    const d1 = await draftPlanLive(repo, lesson.id, "LOCAL");
    const target = d1.slides[1]!.slideId;
    const rev: ReviseOut = { summary: "I rewrote slide 2.", story: null, changes: [{ slideId: target, slide: slide("Two, shorter", [f[1]!]) }], removeSlideIds: [], insert: [] };
    answers.push(rev);
    const { plan, summary } = await revisePlanLive(repo, lesson.id, "LOCAL", { text: "Shorter slide 2", via: "typed" });
    expect(plan.version).toBe(2);
    expect(summary).toMatch(/Draft 2 is ready/);
    expect(plan.slides[0]).toEqual(d1.slides[0]);
    expect(plan.slides[2]).toEqual(d1.slides[2]);
    expect(plan.slides[1]!.changedInVersion).toBe(2);
    expect(repo.get("plans", d1.id)?.status).toBe("superseded");
  });
});

describe("planning in the background", () => {
  beforeEach(() => { answers.length = 0; });

  it("reports working, then ready with the plan; a second start while busy is refused", async () => {
    const { repo, lesson, f } = setup();
    const runId = await startPlanning(repo, lesson.id, "draft");
    expect(repo.get("lessons", lesson.id)?.status).toBe("planning");
    expect(planningStatus(repo, lesson.id, runId)).toEqual({ state: "working" });
    await expect(startPlanning(repo, lesson.id, "draft")).rejects.toThrow(/already working/);
    answers.push({ story: "s", angles: [{ label: "A", story: "a" }, { label: "B", story: "b" }, { label: "C", story: "c" }], learningObjectives: ["x"], assumptions: [], guidelineChecks: [], recap: null,
      slides: [slide("One", [f[0]!]), slide("Two", [f[1]!])] });
    await runPlanning(repo, lesson.id, "LOCAL", runId);
    const st = planningStatus(repo, lesson.id, runId);
    expect(st.state).toBe("ready");
    expect(repo.list("agentRuns")).toHaveLength(1);
  });

  it("a failed run gives a plain message and puts the lesson back, without throwing", async () => {
    const { repo, lesson } = setup();
    const runId = await startPlanning(repo, lesson.id, "draft");
    answers.push({ story: "s", angles: [], learningObjectives: ["x"], assumptions: [], guidelineChecks: [], recap: null, slides: [] });
    await runPlanning(repo, lesson.id, "LOCAL", runId);
    const st = planningStatus(repo, lesson.id, runId);
    expect(st).toMatchObject({ state: "failed", error: expect.stringMatching(/couldn't finish the plan/) });
    expect(repo.get("lessons", lesson.id)?.status).toBe("sourcing");
  });

  it("a revision's summary comes back with the status", async () => {
    const { repo, lesson, f } = setup();
    answers.push({ story: "s", angles: [{ label: "A", story: "a" }, { label: "B", story: "b" }, { label: "C", story: "c" }], learningObjectives: ["x"], assumptions: [], guidelineChecks: [], recap: null,
      slides: [slide("One", [f[0]!]), slide("Two", [f[1]!])] });
    const d1 = await draftPlanLive(repo, lesson.id, "LOCAL");
    const input = { text: "Shorter slide 2", via: "typed" as const };
    const runId = await startPlanning(repo, lesson.id, "revise", input);
    answers.push({ summary: "I shortened slide 2.", story: null, changes: [{ slideId: d1.slides[1]!.slideId, slide: slide("Two", [f[1]!]) }], removeSlideIds: [], insert: [] });
    await runPlanning(repo, lesson.id, "LOCAL", runId, input);
    expect(planningStatus(repo, lesson.id, runId)).toMatchObject({ state: "ready", summary: expect.stringMatching(/Draft 2 is ready. I shortened slide 2/) });
  });
});

describe("assumptions", () => {
  it("drop a repeated 'I assumed' and the closing period", async () => {
    const { tidyAssumption } = await import("./planning");
    expect(tidyAssumption("I assumed that your learners are new.")).toBe("your learners are new");
    expect(tidyAssumption("a hospital setting..")).toBe("a hospital setting");
  });
});
