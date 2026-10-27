import { route } from "@/lib/api";
import { setIntegration } from "@ls/orchestrator";

export const PUT = route<{ id: string }>((repo, { id }, body) => setIntegration(repo, id, body.connected === true));
