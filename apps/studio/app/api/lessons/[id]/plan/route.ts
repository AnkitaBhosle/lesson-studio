import { route } from "@/lib/api";
import { draftPlan } from "@ls/orchestrator";

export const POST = route<{ id: string }>((repo, { id }) => draftPlan(repo, id), { liveOnly: true });
