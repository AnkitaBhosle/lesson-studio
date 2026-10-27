import { z } from "zod";
import * as S from "./schema";

/** Every collection the app persists, with the schema that validates each record. */
export const collections = {
  users: S.User,
  starters: S.Starter,
  templates: S.Template,
  audiences: S.Audience,
  courses: S.Course,
  guidelines: S.Guideline,
  preferences: S.Preferences,
  integrations: S.Integration,
  scheduledTasks: S.ScheduledTask,
  lessons: S.Lesson,
  sources: S.Source,
  plans: S.TeachingPlan,
  artifacts: S.Artifact,
  courseKnowledge: S.CourseKnowledge,
  approvals: S.Approval,
  agentRuns: S.AgentRun,
  costEvents: S.CostEvent,
} as const;

export type CollectionName = keyof typeof collections;
export type Record_<C extends CollectionName> = z.infer<(typeof collections)[C]>;
export type Store = { [C in CollectionName]: Record_<C>[] };

/** CourseKnowledge is keyed by courseId; everything else by id. */
const keyOf = <C extends CollectionName>(name: C, rec: Record_<C>): string =>
  name === "courseKnowledge" ? (rec as S.CourseKnowledge).courseId : (rec as { id: string }).id;

export interface Repo {
  list<C extends CollectionName>(name: C, where?: (r: Record_<C>) => boolean): Record_<C>[];
  get<C extends CollectionName>(name: C, key: string): Record_<C> | undefined;
  /** Validates, then inserts or replaces by key. Returns the stored record. */
  put<C extends CollectionName>(name: C, rec: Record_<C>): Record_<C>;
  remove<C extends CollectionName>(name: C, key: string): void;
  snapshot(): Store;
}

export const cloneStore = (s: Store): Store => structuredClone(s);

/** Validates a whole store; throws with the collection and index of the first bad record. */
export function validateStore(s: Store): void {
  for (const name of Object.keys(collections) as CollectionName[]) {
    s[name].forEach((rec, i) => {
      const res = collections[name].safeParse(rec);
      if (!res.success) throw new Error(`${name}[${i}] invalid: ${res.error.message}`);
    });
  }
}

/**
 * A repository over an in-memory store. `onChange` lets callers persist
 * (a JSON file locally; nothing on Vercel, where each visitor gets an overlay).
 */
export function createRepo(store: Store, onChange?: (s: Store) => void): Repo {
  return {
    list(name, where) {
      const all = store[name] as Record_<typeof name>[];
      return where ? all.filter(where) : all.slice();
    },
    get(name, key) {
      return (store[name] as Record_<typeof name>[]).find((r) => keyOf(name, r) === key);
    },
    put(name, rec) {
      const parsed = collections[name].parse(rec) as Record_<typeof name>;
      const arr = store[name] as Record_<typeof name>[];
      const i = arr.findIndex((r) => keyOf(name, r) === keyOf(name, parsed));
      if (i >= 0) arr[i] = parsed; else arr.push(parsed);
      onChange?.(store);
      return parsed;
    },
    remove(name, key) {
      const arr = store[name] as Record_<typeof name>[];
      const i = arr.findIndex((r) => keyOf(name, r) === key);
      if (i >= 0) { arr.splice(i, 1); onChange?.(store); }
    },
    snapshot() {
      return cloneStore(store);
    },
  };
}
