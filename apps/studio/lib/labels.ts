import type { Lesson, Slide, Source } from "@ls/schema";

export function statusLabel(l: Lesson): { text: string; tone: "ok" | "warn" | "plain" } {
  switch (l.status) {
    case "ready": return { text: "Ready", tone: "ok" };
    case "draft": return { text: "Scheduled", tone: "plain" };
    case "sourcing": return { text: "In progress · adding sources", tone: "warn" };
    case "planning": case "plan_review": return { text: "In progress · planning", tone: "warn" };
    case "generating_preview": case "preview_review": return { text: "In progress · previewing", tone: "warn" };
    case "finalizing": return { text: "Finishing", tone: "warn" };
    case "failed": return { text: "Needs a look", tone: "warn" };
  }
}

export function lessonHref(l: Lesson): string {
  const stage = l.status === "ready" ? "final" : l.status === "preview_review" ? "preview" : l.status === "plan_review" ? "plan" : "sources";
  return `/lessons/${l.id}/${stage}`;
}

export const formatLabel = (l: Lesson) => (l.format === "lecture_deck" ? "Lecture deck" : l.format === "explainer_video" ? "Explainer video" : "Podcast");

export function duration(sec: number): string {
  if (sec >= 600) return `about ${Math.round(sec / 60)} minutes`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return m ? `about ${m} min${s ? ` ${s} sec` : ""}` : `about ${s} sec`;
}

export const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

const KIND: Record<Source["kind"], string> = { text: "Pasted text", pdf: "PDF", url: "Web page", voice_memo: "Voice memo", video: "Video", slides: "Slides", suggested: "Suggested" };
export const sourceKind = (s: Source) => KIND[s.kind];

/** "From:" chips on a plan slide. */
export function slideSources(slide: Slide, sources: Source[]): string[] {
  const names = new Set<string>();
  for (const c of slide.claims) {
    if (c.status !== "grounded") names.add("General knowledge");
    for (const ci of c.citations) names.add(sources.find((s) => s.id === ci.sourceId)?.title ?? "Source");
  }
  return [...names];
}

export const needsCheck = (s: Slide) => s.claims.some((c) => c.status === "general_knowledge_flagged");
export const wasChecked = (s: Slide) => s.claims.some((c) => c.status === "general_knowledge_checked");
