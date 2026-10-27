import { route } from "@/lib/api";
import { FlowError, setSourceVisibility } from "@ls/orchestrator";

export const PUT = route<{ id: string }>((repo, { id }, body) => {
  if (body.visibility !== "cited" && body.visibility !== "private") throw new FlowError("Choose cited or private");
  return setSourceVisibility(repo, id, body.visibility);
});
