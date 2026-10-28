import { inBackground, route } from "@/lib/api";
import { draftPlan, liveModelsAvailable, runPlanning, startPlanning } from "@ls/orchestrator";

// Planning runs after the response is sent; the page polls ./runs/[runId].
export const maxDuration = 300;

export const POST = route<{ id: string }>(async (repo, { id }, _b, _u, s) => {
  if (s.mode !== "live" || !liveModelsAvailable()) return { plan: draftPlan(repo, id) };
  const runId = await startPlanning(repo, id, "draft");
  inBackground(s, (r) => runPlanning(r, id, s.code, runId));
  return { runId };
}, { liveOnly: true });
