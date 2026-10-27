import { route } from "@/lib/api";
import { setScheduledTask } from "@ls/orchestrator";

export const PUT = route<{ id: string }>((repo, { id }, body) => setScheduledTask(repo, id, body.enabled === true));
