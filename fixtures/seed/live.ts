import type { Store } from "@ls/schema";
import { starters, templates, T0 } from "./people";

/** A new live workspace (Spec 04 §10): one teacher, the Starters and curated Templates, nothing else. */
export const liveSeed: Store = {
  users: [{ id: "usr_you", createdAt: T0, updatedAt: T0, name: "You", email: "you@example.com", persona: "course_creator" }],
  starters,
  templates: templates.filter((t) => t.origin === "curated"),
  audiences: [], courses: [], guidelines: [],
  preferences: [{ id: "prf_you_general", createdAt: T0, updatedAt: T0, userId: "usr_you", scope: "general", items: [], removedItemValues: [] }],
  integrations: [], scheduledTasks: [], lessons: [], sources: [], plans: [], artifacts: [], courseKnowledge: [],
  approvals: [], agentRuns: [], costEvents: [],
};
