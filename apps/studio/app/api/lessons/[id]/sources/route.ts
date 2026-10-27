import { route } from "@/lib/api";
import { FlowError, getLessonContext } from "@ls/orchestrator";

export const GET = route<{ id: string }>((repo, { id }) => getLessonContext(repo, id).sources);
// Source Intake on new sources arrives with the real agent (M5); the demo starts from seeded sources.
export const POST = route<{ id: string }>(() => { throw new FlowError("Adding new sources isn't available in this demo yet.", 501); });
