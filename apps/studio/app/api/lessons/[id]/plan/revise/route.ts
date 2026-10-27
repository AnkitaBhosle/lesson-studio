import { route, str } from "@/lib/api";
import { revisePlan } from "@ls/orchestrator";

export const POST = route<{ id: string }>((repo, { id }, body) =>
  revisePlan(repo, id, { text: str(body.text), via: body.via === "dictated" ? "dictated" : "typed", slideId: str(body.slideId) || undefined }));
