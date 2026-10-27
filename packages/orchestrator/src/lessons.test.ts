import { describe, expect, it } from "vitest";
import { cloneStore, createRepo } from "@ls/schema";
import { seed } from "@ls/fixtures";
import {
  approvePlan, approvePreview, chooseVisualVersion, confirmClaim, decideRecap, decideSuggestedSource,
  editSlide, getLessonContext, newVisualVersion, rerecordSlide, resolvePreferences, revisePlan, setSourceVisibility,
} from "./lessons";

const fresh = () => createRepo(cloneStore(seed));
type R = ReturnType<typeof fresh>;
const checkFlagged = (repo: R, lessonId: string) => {
  const plan = repo.get("plans", repo.get("lessons", lessonId)!.currentPlanId!)!;
  plan.slides.filter((s) => s.claims.some((c) => c.status === "general_knowledge_flagged")).forEach((s) => confirmClaim(repo, lessonId, s.slideId));
};

describe("plan drafts", () => {
  it("a revision makes Draft 3, keeps Draft 2, and marks only changed slides", () => {
    const repo = fresh();
    const { plan, summary } = revisePlan(repo, "lsn_index", { text: "Shorter, please", via: "typed" });
    expect(plan.version).toBe(3);
    expect(repo.get("plans", "pln_idx_v2")?.status).toBe("superseded");
    expect(repo.get("lessons", "lsn_index")?.currentPlanId).toBe(plan.id);
    expect(plan.slides.filter((s) => s.changedInVersion === 3).length).toBeGreaterThan(0);
    expect(summary).toMatch(/Draft 3/);
    expect(summary.toLowerCase()).not.toContain("scene");
  });

  it("a slide edit changes only that slide", () => {
    const repo = fresh();
    const p = editSlide(repo, "lsn_index", "sld_idx_2", { narrative: "New words." });
    expect(p.slides.find((s) => s.slideId === "sld_idx_2")?.changeReason).toBe("teacher_edit");
    expect(p.slides.filter((s) => s.changedInVersion === p.version)).toHaveLength(1);
  });

  it("adding the recap puts its slides first", () => {
    const repo = fresh();
    const p = decideRecap(repo, "lsn_photo", "added");
    expect(p.slides).toHaveLength(29);
    expect(p.slides[0]?.slideId).toBe("sld_recap_1");
  });

  it("a flagged claim blocks approval until checked", () => {
    const repo = fresh();
    expect(() => approvePlan(repo, "lsn_photo")).toThrow(/check the flagged/);
    checkFlagged(repo, "lsn_photo");
    expect(approvePlan(repo, "lsn_photo").status).toBe("preview_review");
  });
});

describe("preview and final", () => {
  it("runs Maya's lesson from plan to ready, updating what the course knows", () => {
    const repo = fresh();
    checkFlagged(repo, "lsn_index");
    approvePlan(repo, "lsn_index");
    const take = rerecordSlide(repo, "lsn_index", "sld_idx_4", "Say it slower.");
    expect(take.versionNumber).toBeGreaterThan(1);
    const v = newVisualVersion(repo, "lsn_index", "sld_idx_2", "warmer colors");
    chooseVisualVersion(repo, "lsn_index", "sld_idx_2", 1);
    expect(repo.get("artifacts", v.id)?.chosen).toBe(false);
    expect(approvePreview(repo, "lsn_index").status).toBe("ready");
    const ctx = getLessonContext(repo, "lsn_index");
    expect(ctx.artifacts.some((a) => a.kind === "explainer_video" && a.stage === "final")).toBe(true);
    expect(ctx.knowledge?.covered.some((c) => c.lessonId === "lsn_index")).toBe(true);
  });

  it("an uploaded visual is recorded as the teacher's", () => {
    const repo = fresh();
    checkFlagged(repo, "lsn_index");
    approvePlan(repo, "lsn_index");
    expect(newVisualVersion(repo, "lsn_index", "sld_idx_5", undefined, "upload:my-chart.png").origin).toBe("teacher_upload");
  });
});

describe("sources and preferences", () => {
  it("changes visibility and approves a suggested source", () => {
    const repo = fresh();
    expect(setSourceVisibility(repo, "src_maya_memo", "cited").visibility).toBe("cited");
    decideSuggestedSource(repo, "lsn_photo", "src_ortiz_c4", true);
    expect(repo.get("sources", "src_ortiz_c4")?.approvedForUse).toBe(true);
  });

  it("course preferences override general ones", () => {
    const ids = resolvePreferences(fresh(), "usr_maya", "crs_inv101").effective.map((i) => i.itemId);
    expect(ids).toContain("pi_playful");
    expect(ids).not.toContain("pi_tone");
  });
});

describe("settings", async () => {
  const { updatePreferences } = await import("./settings");
  it("a removed preference is remembered, and an edit becomes the teacher's", () => {
    const repo = fresh();
    updatePreferences(repo, "usr_maya", { op: "edit", itemId: "pi_bullets", value: "Bullets under 6 words" });
    const p = updatePreferences(repo, "usr_maya", { op: "remove", itemId: "pi_photos" });
    expect(p.items.find((i) => i.itemId === "pi_bullets")?.origin).toBe("teacher");
    expect(p.removedItemValues).toContain("Prefer real photos over illustrations");
  });
});
