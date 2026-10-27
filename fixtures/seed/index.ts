import type { Store } from "@ls/schema";
import { audiences, courses, guidelines, integrations, preferences, scheduledTasks, starters, templates, users } from "./people";
import { sources } from "./sources";
import { plans } from "./plans";
import { artifacts, courseKnowledge, lessons } from "./lessons";

export * from "./people";
export * from "./sources";
export * from "./plans";
export * from "./lessons";

/** The full demo dataset. Always deep-clone before mutating (see createMemoryStore). */
export const seed: Store = {
  users, starters, templates, audiences, courses, guidelines, preferences, integrations, scheduledTasks,
  lessons, sources, plans, artifacts, courseKnowledge,
  approvals: [], agentRuns: [], costEvents: [],
};
export * from "./live";
