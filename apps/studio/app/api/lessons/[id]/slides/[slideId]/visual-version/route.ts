import { route, str } from "@/lib/api";
import { newVisualVersion } from "@ls/orchestrator";

export const POST = route<{ id: string; slideId: string }>((repo, { id, slideId }, body) => newVisualVersion(repo, id, slideId, str(body.note)));
