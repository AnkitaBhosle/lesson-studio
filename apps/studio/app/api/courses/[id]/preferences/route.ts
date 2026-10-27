import { route } from "@/lib/api";
import { resolvePreferences, updatePreferences, type PreferenceOp } from "@ls/orchestrator";

export const GET = route<{ id: string }>((repo, { id }, _b, userId) => resolvePreferences(repo, userId, id).course);
export const PUT = route<{ id: string }>((repo, { id }, body, userId) => updatePreferences(repo, userId, body as unknown as PreferenceOp, id));
