import { route, str } from "@/lib/api";
import { editSlide, removeSlide } from "@ls/orchestrator";

const text = (v: unknown) => (typeof v === "string" ? v : undefined);

export const PATCH = route<{ id: string; slideId: string }>((repo, { id, slideId }, body) => editSlide(repo, id, slideId, {
  narrative: text(body.narrative), visual: text(body.visual), speakerNotes: text(body.speakerNotes),
  bullets: Array.isArray(body.bullets) ? body.bullets.map(str).filter(Boolean) : undefined,
}));
export const DELETE = route<{ id: string; slideId: string }>((repo, { id, slideId }) => removeSlide(repo, id, slideId));
