import { route } from "@/lib/api";
import { planningStatus } from "@ls/orchestrator";

export const GET = route<{ id: string; runId: string }>((repo, { id, runId }) => planningStatus(repo, id, runId));
