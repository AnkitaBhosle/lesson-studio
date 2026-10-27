import { route } from "@/lib/api";
import { getLessonContext } from "@ls/orchestrator";

export const GET = route<{ id: string }>((repo, { id }) => getLessonContext(repo, id).drafts);
