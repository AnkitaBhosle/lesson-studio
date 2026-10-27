import { randomUUID } from "node:crypto";
import type { Audience, Lesson, Repo, Source } from "@ls/schema";
import { stubDigest, stubFirstPlan } from "@ls/agents";
import { FlowError } from "./lessons";

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 10)}`;
const ENVELOPE: Record<Lesson["format"], number> = { explainer_video: 600, lecture_deck: 800, podcast_audio: 300 };

/** "How index funds work, for my course audience" → "How index funds work" */
const titleFrom = (topic: string) => {
  const t = topic.trim().replace(/\s+/g, " ").split(/,\s*for\b| for (my|a|an|the) /i)[0]!.trim();
  return (t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 90);
};

/** Starts a lesson in a live workspace: the first one also creates the course (Spec 04 §10). */
export function createLesson(repo: Repo, userId: string, input: { topic: string; starterId?: string; courseId?: string }): Lesson {
  if (input.topic.trim().length < 3) throw new FlowError("Tell me what you're teaching");
  const starter = repo.get("starters", input.starterId ?? "str_detailed");
  if (!starter?.buildable) throw new FlowError("That kind of lesson isn't available yet");
  const t = now();
  let course = input.courseId ? repo.get("courses", input.courseId) : repo.list("courses", (c) => c.ownerId === userId)[0];
  if (!course) {
    const level = (["beginner", "intermediate", "advanced"] as const).find((l) => l === starter.defaultAudience.level) ?? "beginner";
    const context = (["live_lecture", "self_study", "social_feed", "paid_course", "training_session", "personal"] as const).find((c) => c === starter.defaultAudience.context) ?? "self_study";
    const audience: Audience = repo.put("audiences", {
      id: newId("aud"), createdAt: t, updatedAt: t, ownerId: userId, name: context === "live_lecture" ? "My students" : "My audience",
      level, ageBand: context === "live_lecture" ? "college" : "adult", priorKnowledge: starter.defaultAudience.priorKnowledge, context,
    });
    const template = starter.suggestedTemplateIds.map((id) => repo.get("templates", id)).find(Boolean) ?? repo.list("templates")[0]!;
    course = repo.put("courses", {
      id: newId("crs"), createdAt: t, updatedAt: t, ownerId: userId, title: "My lessons", description: "Lessons you've made in Lesson Studio.",
      defaultAudienceId: audience.id, defaultTemplateId: template.id, defaultStarterId: starter.id,
    });
  }
  const title = titleFrom(input.topic);
  return repo.put("lessons", {
    id: newId("lsn"), createdAt: t, updatedAt: t, courseId: course.id, title, teachingGoal: `Understand ${title.charAt(0).toLowerCase()}${title.slice(1)}`,
    format: starter.format, targetDurationSec: starter.defaultTargetDurationSec, starterId: starter.id,
    templateId: course.defaultTemplateId, audienceId: course.defaultAudienceId,
    sourceIds: [], artifactIds: [], sourcesCard: { show: true }, status: "sourcing",
    spend: { limitCredits: ENVELOPE[starter.format], estimatedCredits: 0, spentCredits: 0 },
  });
}

/** Adds pasted text or a link. Intake is the stub until M6 (digests from the text itself; links are read later). */
export function addSource(repo: Repo, lessonId: string, input: { kind: "text" | "url"; title?: string; text?: string; url?: string }): Source {
  const lesson = repo.get("lessons", lessonId);
  if (!lesson) throw new FlowError("Lesson not found", 404);
  if (!["draft", "sourcing", "planning", "plan_review"].includes(lesson.status)) throw new FlowError("Sources can be added before the preview");
  const t = now();
  const id = newId("src");
  let source: Source;
  if (input.kind === "text") {
    const text = (input.text ?? "").trim();
    if (text.length < 40) throw new FlowError("Paste a little more: a paragraph or two is enough");
    if (text.length > 60_000) throw new FlowError("That's a lot of text. Paste the part this lesson needs");
    source = { id, createdAt: t, updatedAt: t, courseId: lesson.courseId, lessonIds: [lesson.id], kind: "text", title: input.title?.trim() || "Your notes",
      origin: "user_paste", rawRef: "inline", extractedText: text, status: "ready", approvedForUse: true, visibility: "private", digest: stubDigest({ id, kind: "text", title: "notes" }, text) };
  } else {
    let url: URL;
    try { url = new URL(input.url ?? ""); } catch { throw new FlowError("That doesn't look like a link"); }
    if (!/^https?:$/.test(url.protocol)) throw new FlowError("Use a web link starting with https://");
    source = { id, createdAt: t, updatedAt: t, courseId: lesson.courseId, lessonIds: [lesson.id], kind: "url", title: input.title?.trim() || url.hostname,
      origin: "url", rawRef: url.toString(), status: "pending", approvedForUse: true, visibility: "cited" };
  }
  repo.put("sources", source);
  repo.put("lessons", { ...lesson, sourceIds: [...lesson.sourceIds, id], status: "sourcing", updatedAt: t });
  return source;
}

export function removeSource(repo: Repo, lessonId: string, sourceId: string) {
  const lesson = repo.get("lessons", lessonId);
  if (!lesson) throw new FlowError("Lesson not found", 404);
  repo.put("lessons", { ...lesson, sourceIds: lesson.sourceIds.filter((s) => s !== sourceId), updatedAt: now() });
}

/** First draft of the plan. Stub planner until M5. */
export function draftPlan(repo: Repo, lessonId: string) {
  const lesson = repo.get("lessons", lessonId);
  if (!lesson) throw new FlowError("Lesson not found", 404);
  if (lesson.currentPlanId) return repo.get("plans", lesson.currentPlanId)!;
  const sources = lesson.sourceIds.map((id) => repo.get("sources", id)).filter((s): s is Source => Boolean(s));
  if (!sources.some((s) => s.digest?.quotableFacts.length)) throw new FlowError("Add your notes first, so the plan is built from what you know");
  const starter = repo.get("starters", lesson.starterId)!;
  const plan = repo.put("plans", stubFirstPlan(lesson, starter, sources, newId("pln"), now()));
  repo.put("lessons", { ...lesson, currentPlanId: plan.id, status: "plan_review", updatedAt: now() });
  return plan;
}
