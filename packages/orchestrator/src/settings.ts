import { randomUUID } from "node:crypto";
import type { PreferenceItem, Preferences, Repo } from "@ls/schema";
import { FlowError } from "./lessons";

const now = () => new Date().toISOString();

export type PreferenceOp =
  | { op: "add"; value: string; overridesItemId?: string }
  | { op: "edit"; itemId: string; value: string }
  | { op: "remove"; itemId: string }
  | { op: "restore"; item: PreferenceItem };

function prefsFor(repo: Repo, userId: string, courseId?: string): Preferences {
  const scope = courseId ? "course" : "general";
  const found = repo.list("preferences", (p) => p.userId === userId && p.scope === scope && (scope === "general" || p.courseId === courseId))[0];
  return found ?? { id: `prf_${randomUUID().slice(0, 8)}`, createdAt: now(), updatedAt: now(), userId, scope, courseId, items: [], removedItemValues: [] };
}

/**
 * Teacher edits always win: anything they add or edit is marked as theirs, and a
 * removed value is remembered so preference learning never brings it back.
 */
export function updatePreferences(repo: Repo, userId: string, op: PreferenceOp, courseId?: string): Preferences {
  const prefs = prefsFor(repo, userId, courseId);
  let { items, removedItemValues } = prefs;
  switch (op.op) {
    case "add": {
      const value = op.value.trim();
      if (!value) throw new FlowError("Write the preference first");
      items = [...items, { itemId: `pi_${randomUUID().slice(0, 8)}`, kind: "note", value, origin: "teacher", overridesItemId: op.overridesItemId }];
      removedItemValues = removedItemValues.filter((v) => v !== value);
      break;
    }
    case "edit":
      if (!items.some((i) => i.itemId === op.itemId)) throw new FlowError("Preference not found", 404);
      items = items.map((i) => (i.itemId === op.itemId ? { ...i, value: op.value.trim() || i.value, origin: "teacher", evidence: undefined } : i));
      break;
    case "remove": {
      const gone = items.find((i) => i.itemId === op.itemId);
      if (!gone) throw new FlowError("Preference not found", 404);
      items = items.filter((i) => i.itemId !== op.itemId);
      removedItemValues = [...removedItemValues, gone.value];
      break;
    }
    case "restore":
      items = [...items, op.item];
      removedItemValues = removedItemValues.filter((v) => v !== op.item.value);
      break;
  }
  return repo.put("preferences", { ...prefs, items, removedItemValues, updatedAt: now() });
}

export function setIntegration(repo: Repo, id: string, connected: boolean) {
  const i = repo.get("integrations", id);
  if (!i) throw new FlowError("App not found", 404);
  return repo.put("integrations", { ...i, status: connected ? "connected" : "not_connected", updatedAt: now() });
}

export function setScheduledTask(repo: Repo, id: string, enabled: boolean) {
  const t = repo.get("scheduledTasks", id);
  if (!t) throw new FlowError("Task not found", 404);
  return repo.put("scheduledTasks", { ...t, enabled, updatedAt: now() });
}

export function addGuideline(repo: Repo, courseId: string, text: string) {
  if (!text.trim()) throw new FlowError("Write the guideline first");
  return repo.put("guidelines", { id: `gdl_${randomUUID().slice(0, 8)}`, createdAt: now(), updatedAt: now(), scope: "course", scopeId: courseId, kind: "content_rule", text: text.trim(), severity: "must" });
}
