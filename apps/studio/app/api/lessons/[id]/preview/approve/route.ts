import { route } from "@/lib/api";
import { approvePreview } from "@ls/orchestrator";

export const POST = route<{ id: string }>((repo, { id }) => approvePreview(repo, id));
