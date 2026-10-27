import { route } from "@/lib/api";
import { confirmClaim } from "@ls/orchestrator";

export const POST = route<{ id: string; slideId: string }>((repo, { id, slideId }) => confirmClaim(repo, id, slideId));
