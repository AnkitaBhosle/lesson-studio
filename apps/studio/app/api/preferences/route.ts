import { route } from "@/lib/api";
import { resolvePreferences, updatePreferences, type PreferenceOp } from "@ls/orchestrator";

export const GET = route((repo, _p, _b, userId) => resolvePreferences(repo, userId).general);
export const PUT = route((repo, _p, body, userId) => updatePreferences(repo, userId, body as unknown as PreferenceOp));
