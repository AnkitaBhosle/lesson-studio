import { route } from "@/lib/api";
import { approvePlan } from "@ls/orchestrator";

export const POST = route<{ id: string }>((repo, { id }) => approvePlan(repo, id));
