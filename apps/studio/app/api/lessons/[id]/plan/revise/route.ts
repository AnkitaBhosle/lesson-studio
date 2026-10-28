import { inBackground, route, str } from "@/lib/api";
import { liveModelsAvailable, revisePlan, runPlanning, startPlanning } from "@ls/orchestrator";

// Live revisions run after the response is sent; the page polls ../runs/[runId].
export const maxDuration = 300;

export const POST = route<{ id: string }>(async (repo, { id }, body, _u, s) => {
  const input = { text: str(body.text), via: body.via === "dictated" ? ("dictated" as const) : ("typed" as const), slideId: str(body.slideId) || undefined };
  if (s.mode !== "live" || !liveModelsAvailable()) return revisePlan(repo, id, input);
  const runId = await startPlanning(repo, id, "revise", input);
  inBackground(s, (r) => runPlanning(r, id, s.code, runId, input));
  return { runId };
});
