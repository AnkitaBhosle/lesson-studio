import { route } from "@/lib/api";
import { chooseVisualVersion } from "@ls/orchestrator";

export const PUT = route<{ id: string; slideId: string; n: string }>((repo, { id, slideId, n }) => chooseVisualVersion(repo, id, slideId, Number(n)));
