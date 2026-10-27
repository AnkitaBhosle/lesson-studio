import { route, str } from "@/lib/api";
import { createLesson } from "@ls/orchestrator";

export const POST = route((repo, _p, body, userId) =>
  createLesson(repo, userId, { topic: str(body.topic), starterId: str(body.starterId) || undefined, courseId: str(body.courseId) || undefined }), { liveOnly: true });
