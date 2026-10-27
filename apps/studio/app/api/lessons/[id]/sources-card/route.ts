import { route, str } from "@/lib/api";
import { setSourcesCard, setSourceVisibility } from "@ls/orchestrator";

export const PUT = route<{ id: string }>((repo, { id }, body) => {
  if (Array.isArray(body.sourceIds)) {
    const shown = new Set(body.sourceIds.map(str));
    for (const sid of repo.get("lessons", id)?.sourceIds ?? []) setSourceVisibility(repo, sid, shown.has(sid) ? "cited" : "private");
  }
  return setSourcesCard(repo, id, body.show !== false);
});
