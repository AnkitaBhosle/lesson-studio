import { route, str } from "@/lib/api";
import { addSource, getLessonContext } from "@ls/orchestrator";

export const GET = route<{ id: string }>((repo, { id }) => getLessonContext(repo, id).sources);
export const POST = route<{ id: string }>((repo, { id }, body) =>
  addSource(repo, id, { kind: body.kind === "url" ? "url" : "text", title: str(body.title), text: str(body.text), url: str(body.url) }), { liveOnly: true });
