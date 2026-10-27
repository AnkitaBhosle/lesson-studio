import { route } from "@/lib/api";
import { decideRecap } from "@ls/orchestrator";

export const POST = route<{ id: string }>((repo, { id }, body) => decideRecap(repo, id, body.decision === "added" ? "added" : "skipped"));
