import type { Slide, TeachingPlan } from "@ls/schema";

/**
 * Stub agents: deterministic, schema-valid, no network. Used in demo mode and
 * until the real agents land (M4–M7). Same output shapes as the real ones.
 */

export interface RevisionResult {
  slides: Slide[];
  changedSlideIds: string[];
  summary: string;
}

const REWRITES: Record<string, string> = {
  sld_idx_3: "Picture two friends who invest the same amount. One pays a little more in yearly fees. Thirty years later, that small difference is a big gap.",
  sld_idx_6: "The biggest mistake? Panicking when the market drops. The people who do well are usually the ones who did nothing.",
};

const shorten = (text: string) => {
  const first = text.split(/(?<=[.?!])\s+/)[0] ?? text;
  return first.length < text.length ? first : text;
};

/** Planning (revise mode). Whole plan, or one slide when slideId is set. */
export function stubRevise(plan: TeachingPlan, note: string, slideId?: string): RevisionResult {
  const targets = slideId ? [slideId] : pickTargets(plan);
  const changed: string[] = [];
  const slides = plan.slides.map((s) => {
    if (!targets.includes(s.slideId)) return s;
    changed.push(s.slideId);
    if (s.narrative !== undefined) return { ...s, narrative: REWRITES[s.slideId] && s.narrative !== REWRITES[s.slideId] ? REWRITES[s.slideId] : shorten(s.narrative) };
    return { ...s, bullets: s.bullets.map(shorten), speakerNotes: s.speakerNotes ? `${s.speakerNotes} (Revised: ${note.trim()})` : s.speakerNotes };
  });
  const orders = plan.slides.filter((s) => changed.includes(s.slideId)).map((s) => s.order);
  const summary = slideId
    ? `I rewrote slide ${orders[0]} from your note.`
    : `I changed ${orders.length === 1 ? "slide" : "slides"} ${orders.join(" and ")} and marked them.`;
  return { slides, changedSlideIds: changed, summary };
}

function pickTargets(plan: TeachingPlan): string[] {
  const preferred = plan.slides.filter((s) => REWRITES[s.slideId] && s.narrative !== REWRITES[s.slideId]).map((s) => s.slideId);
  if (preferred.length) return preferred;
  const content = plan.slides.filter((s) => s.role === "concept" || s.role === "misconception");
  return content.slice(0, 2).map((s) => s.slideId);
}

/** Creation (slide ops): a new placeholder visual URI for version n. */
export const stubVisualUri = (slideId: string, version: number) => `placeholder:visual/${slideId}/${version}`;
export const stubNarrationUri = (slideId: string, take: number) => `placeholder:narration/${slideId}/${take}`;
