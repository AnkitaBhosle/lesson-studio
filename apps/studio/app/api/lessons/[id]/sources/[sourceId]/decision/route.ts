import { route } from "@/lib/api";
import { decideSuggestedSource } from "@ls/orchestrator";

export const POST = route<{ id: string; sourceId: string }>((repo, { id, sourceId }, body) => decideSuggestedSource(repo, id, sourceId, body.use === true));
