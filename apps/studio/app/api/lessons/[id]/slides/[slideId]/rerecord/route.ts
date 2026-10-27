import { route, str } from "@/lib/api";
import { rerecordSlide } from "@ls/orchestrator";

export const POST = route<{ id: string; slideId: string }>((repo, { id, slideId }, body) => rerecordSlide(repo, id, slideId, str(body.narrative)));
