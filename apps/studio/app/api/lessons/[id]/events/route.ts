import { route } from "@/lib/api";
import { getLessonContext } from "@ls/orchestrator";

export const GET = route<{ id: string }>((repo, { id }) => ({
  status: getLessonContext(repo, id).lesson.status,
  runs: repo.list("agentRuns", (r) => r.lessonId === id).map((r) => ({ agent: r.agent, status: r.status, steps: r.steps })),
}));
