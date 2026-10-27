import { randomUUID } from "node:crypto";
import type { Approval, Artifact, Lesson, LessonStatus, PreferenceItem, Repo, Slide, TeachingPlan } from "@ls/schema";
import { stubNarrationUri, stubRevise, stubVisualUri } from "@ls/agents";

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;

export class FlowError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

// ---------- Reading ----------
export function getLessonContext(repo: Repo, lessonId: string) {
  const lesson = repo.get("lessons", lessonId);
  if (!lesson) throw new FlowError("Lesson not found", 404);
  const course = repo.get("courses", lesson.courseId);
  if (!course) throw new FlowError("Course not found", 404);
  const plan = lesson.currentPlanId ? repo.get("plans", lesson.currentPlanId) : undefined;
  return {
    lesson, course, plan,
    drafts: repo.list("plans", (p) => p.lessonId === lessonId).sort((a, b) => a.version - b.version),
    sources: lesson.sourceIds.map((id) => repo.get("sources", id)).filter((s): s is NonNullable<typeof s> => Boolean(s)),
    template: repo.get("templates", lesson.templateId),
    starter: repo.get("starters", lesson.starterId),
    audience: repo.get("audiences", lesson.audienceId),
    guidelines: repo.list("guidelines", (g) => g.scopeId === course.id || g.scopeId === lesson.id),
    knowledge: repo.get("courseKnowledge", course.id),
    artifacts: repo.list("artifacts", (a) => a.lessonId === lessonId),
    preferences: resolvePreferences(repo, course.ownerId, course.id),
  };
}

/** General preferences, with course preferences layered on top (Spec 02 §5). */
export function resolvePreferences(repo: Repo, userId: string, courseId?: string) {
  const general = repo.list("preferences", (p) => p.userId === userId && p.scope === "general")[0];
  const course = courseId ? repo.list("preferences", (p) => p.userId === userId && p.scope === "course" && p.courseId === courseId)[0] : undefined;
  const overridden = new Set((course?.items ?? []).map((i) => i.overridesItemId).filter(Boolean));
  const effective: (PreferenceItem & { level: "general" | "course" })[] = [
    ...(general?.items ?? []).filter((i) => !overridden.has(i.itemId)).map((i) => ({ ...i, level: "general" as const })),
    ...(course?.items ?? []).map((i) => ({ ...i, level: "course" as const })),
  ];
  return { general, course, effective };
}

// ---------- Plan versions ----------
function requirePlan(repo: Repo, lesson: Lesson): TeachingPlan {
  const plan = lesson.currentPlanId ? repo.get("plans", lesson.currentPlanId) : undefined;
  if (!plan) throw new FlowError("This lesson has no plan yet");
  return plan;
}

function setStatus(repo: Repo, lesson: Lesson, status: LessonStatus, extra: Partial<Lesson> = {}) {
  return repo.put("lessons", { ...lesson, ...extra, status, updatedAt: now() });
}

/** Every change makes a new draft; the previous one is kept as superseded. */
function newVersion(repo: Repo, lesson: Lesson, from: TeachingPlan, changes: Partial<TeachingPlan>): TeachingPlan {
  if (!["plan_review", "planning"].includes(lesson.status)) throw new FlowError("The plan can only be changed before it is approved");
  repo.put("plans", { ...from, status: "superseded", updatedAt: now() });
  const next = repo.put("plans", {
    ...from, ...changes, id: newId("pln"), version: from.version + 1, parentPlanId: from.id,
    status: "awaiting_approval", createdAt: now(), updatedAt: now(),
  });
  setStatus(repo, lesson, "plan_review", { currentPlanId: next.id });
  return next;
}

const lessonOf = (repo: Repo, lessonId: string) => {
  const l = repo.get("lessons", lessonId);
  if (!l) throw new FlowError("Lesson not found", 404);
  return l;
};

export function editSlide(repo: Repo, lessonId: string, slideId: string, edits: Partial<Pick<Slide, "narrative" | "visual" | "bullets" | "speakerNotes" | "title">>) {
  // Only fields that were actually sent change; a missing field never blanks the slide.
  const patch = Object.fromEntries(Object.entries(edits).filter(([, v]) => v !== undefined)) as typeof edits;
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  if (!plan.slides.some((s) => s.slideId === slideId)) throw new FlowError("Slide not found", 404);
  // In the preview the plan is approved: text edits land on the slide itself, with no new draft.
  if (lesson.status === "preview_review") {
    return repo.put("plans", { ...plan, updatedAt: now(), slides: plan.slides.map((s) => (s.slideId === slideId ? { ...s, ...patch } : s)) });
  }
  return newVersion(repo, lesson, plan, {
    revisionRequest: undefined,
    slides: plan.slides.map((s) => (s.slideId === slideId ? { ...s, ...patch, changedInVersion: plan.version + 1, changeReason: "teacher_edit" } : s)),
  });
}

export function removeSlide(repo: Repo, lessonId: string, slideId: string) {
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  const slides = plan.slides.filter((s) => s.slideId !== slideId).map((s, i) => ({ ...s, order: i + 1 }));
  return newVersion(repo, lesson, plan, { slides, revisionRequest: undefined });
}

export function confirmClaim(repo: Repo, lessonId: string, slideId: string) {
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  // Confirming a flagged claim is a check, not a content change: update in place.
  return repo.put("plans", {
    ...plan, updatedAt: now(),
    slides: plan.slides.map((s) => s.slideId !== slideId ? s : {
      ...s, claims: s.claims.map((c) => (c.status === "general_knowledge_flagged" ? { ...c, status: "general_knowledge_checked" as const } : c)),
    }),
  });
}

export function editStory(repo: Repo, lessonId: string, input: { story?: string; angleId?: string }) {
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  const angle = input.angleId ? plan.angles.find((a) => a.angleId === input.angleId) : undefined;
  if (input.angleId && !angle) throw new FlowError("Unknown angle", 404);
  return newVersion(repo, lesson, plan, {
    revisionRequest: undefined,
    chosenAngleId: angle?.angleId ?? plan.chosenAngleId,
    story: input.story ?? angle?.story ?? plan.story,
  });
}

export function decideRecap(repo: Repo, lessonId: string, decision: "added" | "skipped") {
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  if (!plan.recap || plan.recap.decision !== "pending") throw new FlowError("No recap suggestion to decide");
  const recap = { ...plan.recap, decision };
  if (decision === "skipped") return repo.put("plans", { ...plan, recap, updatedAt: now() });
  const slides = [...plan.recap.slides, ...plan.slides].map((s, i) => ({ ...s, order: i + 1 }));
  return newVersion(repo, lesson, plan, { recap, slides, revisionRequest: undefined });
}

export function revisePlan(repo: Repo, lessonId: string, input: { text: string; via: "typed" | "dictated"; slideId?: string }) {
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  if (!input.text.trim()) throw new FlowError("Tell me what to change");
  const result = stubRevise(plan, input.text, input.slideId);
  const version = plan.version + 1;
  const next = newVersion(repo, lesson, plan, {
    revisionRequest: { text: input.text, via: input.via, scopeSlideId: input.slideId },
    slides: result.slides.map((s) => (result.changedSlideIds.includes(s.slideId)
      ? { ...s, changedInVersion: version, changeReason: input.slideId ? "slide_rewrite" as const : "plan_revision" as const } : s)),
  });
  return { plan: next, summary: `Draft ${version} is ready. ${result.summary} Your earlier draft is saved.` };
}

// ---------- Gates and creation ----------
function approval(repo: Repo, lesson: Lesson, gate: Approval["gate"], planVersion?: number) {
  repo.put("approvals", { id: newId("apr"), createdAt: now(), updatedAt: now(), lessonId: lesson.id, gate, planVersion, decision: "approved", edits: [] });
}

const visualKind = (s: Slide): Artifact["kind"] => (s.visualType === "generated_clip" ? "clip" : "image");

export function approvePlan(repo: Repo, lessonId: string) {
  const lesson = lessonOf(repo, lessonId);
  const plan = requirePlan(repo, lesson);
  if (lesson.status !== "plan_review") throw new FlowError("This plan was already approved");
  if (plan.slides.some((s) => s.claims.some((c) => c.status === "general_knowledge_flagged" || c.status === "unsupported"))) {
    throw new FlowError("Please check the flagged slides before approving");
  }
  repo.put("plans", { ...plan, status: "approved", updatedAt: now() });
  approval(repo, lesson, "plan", plan.version);
  setStatus(repo, lesson, "generating_preview");
  // Creation (stub): one narration and one visual per slide that doesn't already have them.
  const existing = repo.list("artifacts", (a) => a.lessonId === lesson.id && a.stage === "draft");
  for (const s of plan.slides) {
    if (lesson.format === "explainer_video" && !existing.some((a) => a.slideId === s.slideId && a.kind === "narration_audio")) {
      repo.put("artifacts", artifact(lesson, s.slideId, "narration_audio", stubNarrationUri(s.slideId, 1), 1, "generated"));
    }
    if (!existing.some((a) => a.slideId === s.slideId && (a.kind === "image" || a.kind === "clip"))) {
      repo.put("artifacts", artifact(lesson, s.slideId, visualKind(s), stubVisualUri(s.slideId, 1), 1, s.visualType === "diagram" || s.visualType === "title_card" ? "rendered" : "generated"));
    }
  }
  return setStatus(repo, lessonOf(repo, lessonId), "preview_review");
}

function artifact(lesson: Lesson, slideId: string, kind: Artifact["kind"], uri: string, versionNumber: number, origin: Artifact["origin"], versionNote?: string): Artifact {
  return { id: newId("art"), createdAt: now(), updatedAt: now(), lessonId: lesson.id, courseId: lesson.courseId, kind, stage: "draft", uri, slideId, versionNumber, chosen: true, origin, versionNote };
}

function requirePreview(lesson: Lesson) {
  if (lesson.status !== "preview_review") throw new FlowError("Slides can be changed this way only during the preview");
}

export function rerecordSlide(repo: Repo, lessonId: string, slideId: string, narrative: string) {
  const lesson = lessonOf(repo, lessonId);
  requirePreview(lesson);
  const plan = requirePlan(repo, lesson);
  repo.put("plans", { ...plan, updatedAt: now(), slides: plan.slides.map((s) => (s.slideId === slideId ? { ...s, narrative } : s)) });
  const takes = repo.list("artifacts", (a) => a.lessonId === lessonId && a.slideId === slideId && a.kind === "narration_audio");
  takes.forEach((a) => repo.put("artifacts", { ...a, chosen: false }));
  return repo.put("artifacts", artifact(lesson, slideId, "narration_audio", stubNarrationUri(slideId, takes.length + 1), takes.length + 1, "generated"));
}

const visualsOf = (repo: Repo, lessonId: string, slideId: string) =>
  repo.list("artifacts", (a) => a.lessonId === lessonId && a.slideId === slideId && (a.kind === "image" || a.kind === "clip")).sort((a, b) => a.versionNumber - b.versionNumber);

export function newVisualVersion(repo: Repo, lessonId: string, slideId: string, note?: string, uploadUri?: string) {
  const lesson = lessonOf(repo, lessonId);
  requirePreview(lesson);
  const plan = requirePlan(repo, lesson);
  const slide = plan.slides.find((s) => s.slideId === slideId);
  if (!slide) throw new FlowError("Slide not found", 404);
  const versions = visualsOf(repo, lessonId, slideId);
  versions.forEach((a) => repo.put("artifacts", { ...a, chosen: false }));
  const n = versions.length + 1;
  return repo.put("artifacts", artifact(lesson, slideId, visualKind(slide), uploadUri ?? stubVisualUri(slideId, n), n, uploadUri ? "teacher_upload" : "generated", note?.trim() || undefined));
}

export function chooseVisualVersion(repo: Repo, lessonId: string, slideId: string, versionNumber: number) {
  const versions = visualsOf(repo, lessonId, slideId);
  if (!versions.some((a) => a.versionNumber === versionNumber)) throw new FlowError("Version not found", 404);
  versions.forEach((a) => repo.put("artifacts", { ...a, chosen: a.versionNumber === versionNumber }));
}

export function approvePreview(repo: Repo, lessonId: string) {
  const lesson = lessonOf(repo, lessonId);
  requirePreview(lesson);
  const plan = requirePlan(repo, lesson);
  approval(repo, lesson, "preview", plan.version);
  setStatus(repo, lesson, "finalizing");
  const kinds: Artifact["kind"][] = lesson.format === "explainer_video" ? ["explainer_video", "captions", "thumbnail", "sources_card"] : ["lecture_deck", "pdf_export"];
  for (const kind of kinds) repo.put("artifacts", { ...artifact(lesson, "", kind, `placeholder:${kind}/${lesson.id}`, 1, "rendered"), slideId: undefined, stage: "final" });
  // The course now knows what this lesson covered.
  const k = repo.get("courseKnowledge", lesson.courseId) ?? { courseId: lesson.courseId, covered: [], updatedAt: now() };
  repo.put("courseKnowledge", {
    ...k, updatedAt: now(),
    covered: [...k.covered.filter((c) => c.lessonId !== lesson.id), { lessonId: lesson.id, lessonTitle: lesson.title, concepts: plan.learningObjectives }],
  });
  return setStatus(repo, lessonOf(repo, lessonId), "ready");
}

// ---------- Sources ----------
export function setSourceVisibility(repo: Repo, sourceId: string, visibility: "cited" | "private") {
  const s = repo.get("sources", sourceId);
  if (!s) throw new FlowError("Source not found", 404);
  return repo.put("sources", { ...s, visibility, updatedAt: now() });
}

export function decideSuggestedSource(repo: Repo, lessonId: string, sourceId: string, use: boolean) {
  const lesson = lessonOf(repo, lessonId);
  const s = repo.get("sources", sourceId);
  if (!s) throw new FlowError("Source not found", 404);
  if (use) {
    repo.put("sources", { ...s, approvedForUse: true, status: "ready", updatedAt: now() });
    approval(repo, lesson, "suggested_source");
  } else {
    repo.put("lessons", { ...lesson, sourceIds: lesson.sourceIds.filter((id) => id !== sourceId), updatedAt: now() });
  }
}

export function setSourcesCard(repo: Repo, lessonId: string, show: boolean) {
  const lesson = lessonOf(repo, lessonId);
  return repo.put("lessons", { ...lesson, sourcesCard: { show }, updatedAt: now() });
}
