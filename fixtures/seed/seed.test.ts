import { describe, expect, it } from "vitest";
import { cloneStore, createRepo, validateStore } from "@ls/schema";
import { seed } from "./index";

describe("seed data", () => {
  it("validates against the domain model", () => {
    expect(() => validateStore(seed)).not.toThrow();
  });

  it("has the two hero lessons with current plans", () => {
    const maya = seed.lessons.find((l) => l.id === "lsn_index");
    const ortiz = seed.lessons.find((l) => l.id === "lsn_photo");
    expect(maya?.currentPlanId).toBe("pln_idx_v2");
    expect(ortiz?.currentPlanId).toBe("pln_photo_v1");
  });

  it("Maya's Draft 2 changes only slides 3 and 6", () => {
    const [d1, d2] = ["pln_idx_v1", "pln_idx_v2"].map((id) => seed.plans.find((p) => p.id === id)!);
    const changed = d2!.slides.filter((s, i) => s.narrative !== d1!.slides[i]!.narrative).map((s) => s.order);
    expect(changed).toEqual([3, 6]);
  });

  it("Dr. Ortiz's lecture has 27 slides and a pending recap", () => {
    const p = seed.plans.find((x) => x.id === "pln_photo_v1")!;
    expect(p.slides).toHaveLength(27);
    expect(p.recap?.decision).toBe("pending");
  });

  it("every factual claim cites a fact that exists, or is flagged", () => {
    const facts = new Set(seed.sources.flatMap((s) => (s.digest?.quotableFacts ?? []).map((f) => `${s.id}/${f.factId}`)));
    for (const plan of seed.plans) for (const slide of plan.slides) for (const c of slide.claims) {
      if (c.status === "grounded") for (const ci of c.citations) expect(facts.has(`${ci.sourceId}/${ci.factId}`), `${plan.id} ${slide.slideId}`).toBe(true);
      else expect(c.citations).toHaveLength(0);
    }
  });

  it("notes and voice memos are private; readings are cited", () => {
    for (const s of seed.sources) {
      if (["text", "voice_memo"].includes(s.kind)) expect(s.visibility).toBe("private");
      if (["pdf", "url", "suggested"].includes(s.kind)) expect(s.visibility).toBe("cited");
    }
  });

  it("teacher-facing plan text never says scene", () => {
    const text = JSON.stringify(seed.plans.map((p) => [p.story, p.angles, p.slides.map((s) => [s.title, s.narrative, s.visual, s.bullets, s.speakerNotes])]));
    expect(text.toLowerCase()).not.toContain("scene");
  });
});

describe("repository", () => {
  it("puts, gets and validates records", () => {
    const repo = createRepo(cloneStore(seed));
    const lesson = repo.get("lessons", "lsn_index")!;
    repo.put("lessons", { ...lesson, title: "Index funds, simply" });
    expect(repo.get("lessons", "lsn_index")?.title).toBe("Index funds, simply");
    expect(() => repo.put("lessons", { ...lesson, status: "nope" as never })).toThrow();
  });

  it("keys course knowledge by course", () => {
    const repo = createRepo(cloneStore(seed));
    expect(repo.get("courseKnowledge", "crs_bio101")?.covered).toHaveLength(2);
  });
});
