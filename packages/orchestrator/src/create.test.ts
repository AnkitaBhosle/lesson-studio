import { describe, expect, it } from "vitest";
import { cloneStore, createRepo } from "@ls/schema";
import { liveSeed } from "@ls/fixtures";
import { addSource, createLesson, draftPlan } from "./create";
import { approvePlan, confirmClaim } from "./lessons";
import { signCode, verifySignedCode } from "./access";

const NOTES = "Hand hygiene is the single most important way to stop infections spreading in hospital. Use alcohol rub unless hands look dirty. Rub for twenty to thirty seconds, until dry. Rings and long nails trap bacteria.";

describe("live workspace: start from scratch", () => {
  it("creates the first course with the first lesson, then plans from pasted notes", () => {
    const repo = createRepo(cloneStore(liveSeed));
    const lesson = createLesson(repo, "usr_you", { topic: "hand hygiene, for first-year nursing students", starterId: "str_lecture" });
    expect(lesson.title).toBe("Hand hygiene");
    expect(repo.list("courses")).toHaveLength(1);
    expect(() => draftPlan(repo, lesson.id)).toThrow(/Add your notes/);
    addSource(repo, lesson.id, { kind: "text", text: NOTES });
    const plan = draftPlan(repo, lesson.id);
    expect(plan.slides.length).toBeGreaterThan(3);
    expect(plan.slides.every((s) => s.claims.every((c) => c.citations.length > 0))).toBe(true);
    plan.slides.forEach((s) => confirmClaim(repo, lesson.id, s.slideId));
    expect(approvePlan(repo, lesson.id).status).toBe("preview_review");
  });

  it("a second lesson reuses the course", () => {
    const repo = createRepo(cloneStore(liveSeed));
    createLesson(repo, "usr_you", { topic: "Emergency funds" });
    createLesson(repo, "usr_you", { topic: "Budgeting basics" });
    expect(repo.list("courses")).toHaveLength(1);
  });

  it("refuses starters that aren't built yet", () => {
    const repo = createRepo(cloneStore(liveSeed));
    expect(() => createLesson(repo, "usr_you", { topic: "Podcast", starterId: "str_podcast" })).toThrow();
  });
});

describe("access cookie", () => {
  it("accepts its own signature and rejects tampering", () => {
    const v = signCode("RW-ABC-123");
    expect(verifySignedCode(v)).toBe("RW-ABC-123");
    expect(verifySignedCode(v.replace("RW-ABC", "RW-XYZ"))).toBeNull();
    expect(verifySignedCode("RW-ABC-123.nope")).toBeNull();
    expect(verifySignedCode(undefined)).toBeNull();
  });
});
