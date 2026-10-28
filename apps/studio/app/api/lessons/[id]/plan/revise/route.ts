import { route, str } from "@/lib/api";
import { liveModelsAvailable, revisePlan, revisePlanLive } from "@ls/orchestrator";

export const maxDuration = 180;

export const POST = route<{ id: string }>((repo, { id }, body, _u, s) => {
  const input = { text: str(body.text), via: body.via === "dictated" ? ("dictated" as const) : ("typed" as const), slideId: str(body.slideId) || undefined };
  return s.mode === "live" && liveModelsAvailable() ? revisePlanLive(repo, id, s.code, input) : revisePlan(repo, id, input);
});
