import { z } from "zod";
import type { Audience, CourseKnowledge, Guideline, Lesson, PreferenceItem, Slide, Source, Starter, Template, TeachingPlan } from "@ls/schema";

/**
 * Planning agent (Spec 03 §2): prompts and output shapes. The orchestrator calls the model
 * through packages/models and turns these outputs into TeachingPlan versions.
 */

// ---------- What the model returns ----------
const ClaimOut = z.object({
  text: z.string().describe("The factual statement, in plain words"),
  factIds: z.array(z.string()).describe("IDs from the FACTS list that support it; empty only if flagged"),
  status: z.enum(["grounded", "general_knowledge_flagged"]),
});
const VisualTypeOut = z.enum(["title_card", "diagram", "still_image", "generated_clip"]);
const Role = z.enum(["hook", "context", "concept", "example", "misconception", "recap", "cta", "title", "question"]);
const common = {
  role: Role,
  title: z.string(),
  visual: z.string().describe("What the viewer sees, described for the teacher in one plain sentence"),
  visualType: VisualTypeOut,
  whyThisVisual: z.string().describe("Internal: why this visual type teaches best here"),
  claims: z.array(ClaimOut),
};
/** Explainer video slide: what is said, and for how long. */
export const VideoSlideOut = z.object({
  ...common,
  narrative: z.string().describe("Exactly what is said on this slide, as the teacher would say it"),
  estDurationSec: z.number().describe("Seconds this slide is on screen"),
});
/** Lecture deck slide: section, on-slide text and speaker notes. */
export const DeckSlideOut = z.object({
  ...common,
  section: z.string().describe("The section this slide belongs to"),
  bullets: z.array(z.string()).describe("The short text on the slide (a title slide may have one line)"),
  speakerNotes: z.string().describe("What the teacher says while this slide is up"),
});
export type SlideOut = z.infer<typeof VideoSlideOut> | z.infer<typeof DeckSlideOut>;

/** Output shapes depend on the format, so every required field really is required. */
export function draftSchema(deck: boolean) {
  const S = deck ? DeckSlideOut : VideoSlideOut;
  return z.object({
    story: z.string().describe("2–3 sentences: how this lesson is told"),
    angles: z.array(z.object({ label: z.string(), story: z.string() })).describe("Exactly three: the first is the chosen story; two genuinely different alternatives"),
    learningObjectives: z.array(z.string()).describe("1 to 5 objectives"),
    assumptions: z.array(z.string()).describe("Defaults you chose without asking. Each finishes the sentence 'I assumed …' without repeating those words, e.g. 'your learners are new to hospital work'"),
    slides: z.array(S),
    recap: z.object({ fromLessonId: z.string(), summary: z.string(), slides: z.array(S) }).nullable()
      .describe("Only if an earlier lesson in COURSE KNOWLEDGE sets this one up; otherwise null"),
    guidelineChecks: z.array(z.object({ guidelineId: z.string(), passed: z.boolean(), note: z.string() })),
  });
}
export type DraftOut = z.infer<ReturnType<typeof draftSchema>>;

export function reviseSchema(deck: boolean) {
  const S = deck ? DeckSlideOut : VideoSlideOut;
  return z.object({
    summary: z.string().describe("One or two plain sentences for the teacher, e.g. 'I changed slides 3 and 6 and marked them.'"),
    story: z.string().nullable().describe("A new story only if the note changes how the lesson is told; otherwise null"),
    changes: z.array(z.object({ slideId: z.string(), slide: S })).describe("Slides you rewrote, by slideId. Leave every other slide out"),
    removeSlideIds: z.array(z.string()),
    insert: z.array(z.object({ afterSlideId: z.string().nullable(), slide: S })).describe("New slides; afterSlideId null = at the start"),
  });
}
export type ReviseOut = z.infer<ReturnType<typeof reviseSchema>>;

// ---------- Context ----------
export interface PlanningContext {
  lesson: Lesson; starter: Starter; template: Template; audience: Audience; guidelines: Guideline[];
  preferences: (PreferenceItem & { level: string })[]; knowledge?: CourseKnowledge; sources: Source[]; clipsAllowed: number;
}

export const factIndex = (sources: Source[]) =>
  new Map(sources.flatMap((s) => (s.digest?.quotableFacts ?? []).map((f) => [f.factId, { ...f, sourceId: s.id, sourceTitle: s.title }] as const)));

const minutes = (sec: number) => (sec >= 120 ? `${Math.round(sec / 60)} minutes` : `${sec} seconds`);

export const PLANNING_SYSTEM = `You are the planning assistant in Lesson Studio, a tool that helps teachers turn their notes and readings into a lesson: a narrated explainer video or a lecture deck. You write the teaching plan a teacher approves before anything is made.

How to plan
- Teach, don't summarize. Build an arc: a hook that creates a question, the context, one idea per slide, a concrete example, the common mistake, a recap, and (for videos) a clear next step. Decks are grouped into sections, one per learning objective, each ending with a short check-for-understanding question slide.
- Fit the audience exactly. Define every term the first time it appears. Use examples from the audience's world.
- Ground every factual claim in the teacher's sources: cite fact IDs from the FACTS list. If a point the lesson needs isn't in the sources, you may include it only as a claim with status "general_knowledge_flagged" and no fact IDs, so the teacher checks it. Never invent a fact ID. Prefer leaving a point out over inventing a statistic.
- Visuals: choose the cheapest type that teaches equally well. title_card for titles and closings; diagram for structures, steps, comparisons and numbers; still_image for places, objects and people; generated_clip only for motion, processes or scale that a still can't show. The VISUAL LIMIT says how many generated clips the lesson may use.
- Length: explainer narration runs about 150 words per minute, so the total should land within 10% of the target length. Decks run about one slide per 1.5–2 minutes.
- Follow every guideline and preference you're given. Report each guideline in guidelineChecks.
- Story angles: give three genuinely different ways to tell this lesson (e.g. start from a question, follow one example through, start from a misconception), the first being the one your slides follow.
- Recap: only if COURSE KNOWLEDGE shows an earlier lesson that sets this one up, propose a 1–3 slide recap of it. Otherwise leave recap out.

How to write
- Write for the teacher, like a colleague's lesson outline: warm, plain and specific.
- Never mention cost, credits, budgets, models, AI, tokens or production terms, and never use the word "scene". The unit is always a "slide".
- Narration is what the teacher would say out loud: short sentences, no headings, no lists.`;

export function draftPrompt(c: PlanningContext): string {
  const facts = [...factIndex(c.sources).values()];
  const deck = c.lesson.format === "lecture_deck";
  return [
    `LESSON: "${c.lesson.title}". Goal: ${c.lesson.teachingGoal}.`,
    `FORMAT: ${deck ? "lecture deck for a live class" : "narrated explainer video"}, about ${minutes(c.lesson.targetDurationSec)}.`,
    `STARTER: ${c.starter.name}. Teaching structure: ${c.starter.teachingStructure.join(" → ")}.`,
    `AUDIENCE: ${c.audience.name}; level ${c.audience.level}; age ${c.audience.ageBand}; setting ${c.audience.context.replace("_", " ")}; already knows: ${c.audience.priorKnowledge}.`,
    `VOICE AND TONE: ${c.template.voiceAndTone}.`,
    `VISUAL LIMIT: at most ${c.clipsAllowed} generated_clip slides.`,
    `GUIDELINES:\n${c.guidelines.map((g) => `- [${g.id}] (${g.severity}) ${g.text}`).join("\n") || "- none"}`,
    `PREFERENCES (course-level ones override general ones):\n${c.preferences.map((p) => `- ${p.kind === "note" ? "" : `${p.kind}: `}${p.value}`).join("\n") || "- none"}`,
    `COURSE KNOWLEDGE (earlier lessons):\n${c.knowledge?.covered.filter((k) => k.lessonId !== c.lesson.id).map((k) => `- [${k.lessonId}] ${k.lessonTitle}: ${k.concepts.join(", ")}`).join("\n") || "- none yet"}`,
    `SOURCES:\n${c.sources.map((s) => `- ${s.title} (${s.visibility})${s.digest ? `: ${s.digest.summary}` : ""}`).join("\n")}`,
    `FACTS (cite these IDs):\n${facts.map((f) => `- [${f.factId}] ${f.text} (${f.sourceTitle}, ${f.locator})`).join("\n")}`,
    `Write the plan.`,
  ].join("\n\n");
}

const slideForPrompt = (s: Slide) => ({
  slideId: s.slideId, role: s.role, section: s.section, title: s.title, narrative: s.narrative, bullets: s.bullets, speakerNotes: s.speakerNotes,
  visual: s.visual, visualType: s.visualType, claims: s.claims.map((c) => ({ text: c.text, factIds: c.citations.map((x) => x.factId).filter(Boolean), status: c.status })),
});

export function revisePrompt(c: PlanningContext, plan: TeachingPlan, note: string, slideId?: string): string {
  return [
    draftPrompt(c).replace(/Write the plan\.$/, ""),
    `CURRENT PLAN (story): ${plan.story}`,
    `CURRENT SLIDES:\n${JSON.stringify(plan.slides.map(slideForPrompt), null, 1)}`,
    slideId
      ? `THE TEACHER'S NOTE, about slide ${slideId} only: "${note}"\nRewrite only that slide. Return it in changes; remove and insert nothing.`
      : `THE TEACHER'S NOTE: "${note}"\nChange only what the note asks for. Return just the slides you changed (by slideId), any slides to remove, and any new slides to insert. Every slide you leave out stays exactly as it is.`,
    `Then write the changes.`,
  ].join("\n\n");
}

// ---------- Checks the model's answer must pass (else repair, then escalate) ----------
export function checkSlides(slides: SlideOut[], facts: Map<string, unknown>, deck: boolean): string | null {
  for (const [i, s] of slides.entries()) {
    for (const c of s.claims) {
      const unknown = c.factIds.filter((id) => !facts.has(id));
      if (unknown.length) return `slide ${i + 1} cites fact IDs that don't exist: ${unknown.join(", ")}`;
      if (c.status === "grounded" && c.factIds.length === 0) return `slide ${i + 1} has a grounded claim with no fact IDs; cite one or flag it`;
      if (c.status === "general_knowledge_flagged" && c.factIds.length) return `slide ${i + 1} has a flagged claim with fact IDs; flagged claims cite nothing`;
    }
    if (!deck && !("narrative" in s && s.narrative.trim())) return `slide ${i + 1} needs narration`;
    if (deck && s.role !== "title" && !("bullets" in s && s.bullets.length)) return `slide ${i + 1} needs bullets`;
  }
  return null;
}

export function checkDraft(d: DraftOut, c: PlanningContext): string | null {
  const facts = factIndex(c.sources);
  const deck = c.lesson.format === "lecture_deck";
  if (d.angles.length !== 3) return `give exactly three angles (you gave ${d.angles.length})`;
  if (d.learningObjectives.length < 1 || d.learningObjectives.length > 5) return "give 1 to 5 learning objectives";
  if (d.slides.length < 2) return "a plan needs at least two slides";
  const problem = checkSlides([...d.slides, ...(d.recap?.slides ?? [])], facts, deck);
  if (problem) return problem;
  const clips = d.slides.filter((s) => s.visualType === "generated_clip").length;
  if (clips > c.clipsAllowed) return `${clips} generated_clip slides; the limit is ${c.clipsAllowed}. Use still_image or diagram instead`;
  if (d.recap && !c.knowledge?.covered.some((k) => k.lessonId === d.recap!.fromLessonId && k.lessonId !== c.lesson.id)) return `recap.fromLessonId must be one of the earlier lessons in COURSE KNOWLEDGE, or leave recap out`;
  return null;
}

export function checkRevision(r: ReviseOut, plan: TeachingPlan, c: PlanningContext, slideId?: string): string | null {
  const ids = new Set(plan.slides.map((s) => s.slideId));
  const bad = [...r.changes.map((x) => x.slideId), ...r.removeSlideIds, ...r.insert.map((x) => x.afterSlideId).filter((x): x is string => Boolean(x))].filter((id) => !ids.has(id));
  if (bad.length) return `unknown slideIds: ${bad.join(", ")}`;
  if (slideId && (r.changes.some((x) => x.slideId !== slideId) || r.removeSlideIds.length || r.insert.length)) return `only slide ${slideId} may change`;
  if (!r.changes.length && !r.removeSlideIds.length && !r.insert.length && !r.story) return "nothing changed; make the change the note asks for";
  return checkSlides([...r.changes.map((x) => x.slide), ...r.insert.map((x) => x.slide)], factIndex(c.sources), c.lesson.format === "lecture_deck");
}
