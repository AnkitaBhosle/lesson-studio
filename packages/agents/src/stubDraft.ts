import type { Lesson, Slide, Source, SourceDigest, Starter, TeachingPlan } from "@ls/schema";

/**
 * Stub Source Intake and stub Planning (first draft) for live workspaces until the real
 * agents land (M5, M6). Deterministic, schema-valid, built only from the teacher's own text.
 */
const sentences = (text: string) =>
  text.replace(/\s+/g, " ").split(/(?<=[.?!])\s+/).map((s) => s.trim()).filter((s) => s.length > 20 && s.length < 260);

export function stubDigest(source: Pick<Source, "id" | "kind" | "title">, text: string): SourceDigest {
  const lines = sentences(text);
  const prefix = source.id.replace(/^src_/, "").slice(0, 6);
  return {
    summary: lines[0] ?? (source.kind === "url" ? "A web page to read when planning." : "Your notes."),
    keyConcepts: [],
    quotableFacts: lines.slice(0, 12).map((t, i) => ({ factId: `${prefix}_f${i + 1}`, text: t, locator: `line ${i + 1}` })),
    figures: [],
    readingLevel: "beginner",
  };
}

const ROLE_TITLE: Record<Slide["role"], string> = {
  hook: "Why this matters", context: "The big picture", concept: "The key idea", example: "An example",
  misconception: "A common mistake", recap: "Recap", cta: "What to do next", title: "", question: "Check for understanding",
};

export function stubFirstPlan(lesson: Lesson, starter: Starter, sources: Source[], planId: string, now: string): TeachingPlan {
  const facts = sources.flatMap((s) => (s.digest?.quotableFacts ?? []).map((f) => ({ ...f, sourceId: s.id })));
  const deck = lesson.format === "lecture_deck";
  const roles: Slide["role"][] = deck
    ? ["title", ...Array.from({ length: Math.min(Math.max(facts.length, 3), 10) }, () => "concept" as const), "question", "recap"]
    : starter.teachingStructure.filter((r): r is Slide["role"] => r in ROLE_TITLE);
  let next = 0;
  const slides: Slide[] = roles.map((role, i) => {
    const fact = role === "title" || role === "cta" ? undefined : facts[next++ % Math.max(facts.length, 1)];
    const title = role === "title" ? lesson.title : fact && role === "concept" ? fact.text.split(/[,:;]/)[0]!.slice(0, 60) : ROLE_TITLE[role];
    const words = fact?.text ?? (role === "cta" ? "Here's what to try next." : `Let's look at ${lesson.title.toLowerCase()}.`);
    return {
      slideId: `sld_${planId.slice(4)}_${i + 1}`, order: i + 1, role, title,
      narrative: deck ? undefined : words, estDurationSec: deck ? undefined : Math.round(lesson.targetDurationSec / roles.length),
      bullets: deck && role !== "title" ? [words] : deck ? [lesson.teachingGoal] : [],
      speakerNotes: deck ? "Explain this in your own words, then check the room is with you." : undefined,
      visual: role === "title" || role === "cta" ? "Title card in your template" : "A simple diagram of this idea",
      visualType: role === "title" || role === "cta" ? "title_card" : "diagram",
      claims: fact ? [{ text: fact.text, citations: [{ sourceId: fact.sourceId, factId: fact.factId, locator: fact.locator }], status: "grounded" }] : [],
      estCredits: 0,
    };
  });
  const angles = [
    { angleId: "ang_question", label: "Start with a question", story: `Open with a question about ${lesson.title.toLowerCase()}, then answer it step by step.` },
    { angleId: "ang_example", label: "Start with an example", story: `Open with a concrete example, then explain the idea behind it.` },
    { angleId: "ang_mistake", label: "Start from a mistake", story: `Open with a common misunderstanding, then show what really happens.` },
  ];
  return {
    id: planId, createdAt: now, updatedAt: now, lessonId: lesson.id, version: 1, format: lesson.format,
    story: angles[0]!.story, chosenAngleId: angles[0]!.angleId, angles,
    learningObjectives: [lesson.teachingGoal],
    assumptions: ["This is a first draft built from your sources; change anything"],
    slides,
    costEstimate: { totalCredits: 0, byType: {}, llmCredits: 0, ttsCredits: 0, withinEnvelope: true, downgradesApplied: [] },
    guidelineChecks: [], status: "awaiting_approval",
  };
}
