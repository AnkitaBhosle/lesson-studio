import { route } from "@/lib/api";
import { removeSource } from "@ls/orchestrator";

export const DELETE = route<{ id: string; sourceId: string }>((repo, { id, sourceId }) => removeSource(repo, id, sourceId), { liveOnly: true });
