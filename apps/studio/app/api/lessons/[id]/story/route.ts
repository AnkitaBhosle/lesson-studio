import { route, str } from "@/lib/api";
import { editStory } from "@ls/orchestrator";

export const PATCH = route<{ id: string }>((repo, { id }, body) => editStory(repo, id, { story: str(body.story) || undefined, angleId: str(body.angleId) || undefined }));
