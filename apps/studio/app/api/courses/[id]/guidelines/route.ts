import { route, str } from "@/lib/api";
import { addGuideline } from "@ls/orchestrator";

export const POST = route<{ id: string }>((repo, { id }, body) => addGuideline(repo, id, str(body.text)));
