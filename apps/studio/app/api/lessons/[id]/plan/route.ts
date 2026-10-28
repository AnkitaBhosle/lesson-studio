import { route } from "@/lib/api";
import { draftPlan, draftPlanLive, liveModelsAvailable } from "@ls/orchestrator";

export const maxDuration = 180;

export const POST = route<{ id: string }>((repo, { id }, _b, _u, s) =>
  s.mode === "live" && liveModelsAvailable() ? draftPlanLive(repo, id, s.code) : draftPlan(repo, id), { liveOnly: true });
