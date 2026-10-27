import { route, str } from "@/lib/api";
import { newVisualVersion } from "@ls/orchestrator";

// The demo records the upload by file name; storing the file itself arrives with the media layer.
export const POST = route<{ id: string; slideId: string }>((repo, { id, slideId }, body) =>
  newVisualVersion(repo, id, slideId, undefined, `upload:${str(body.fileName) || "your-file"}`));
