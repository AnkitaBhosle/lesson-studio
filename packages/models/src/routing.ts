/**
 * Model routing and prices (Spec 03 §0.3). Model IDs and prices live only here.
 * Prices in credits per million tokens (1 credit = $0.01). Verify against the provider before relying on them.
 */
export type Task = "source_extraction" | "planning" | "self_check" | "preference_learning";

export interface ModelInfo { id: string; provider: "anthropic"; inputPerM: number; outputPerM: number }

export const MODELS: Record<string, ModelInfo> = {
  "claude-haiku-5-5": { id: "claude-haiku-5-5", provider: "anthropic", inputPerM: 10, outputPerM: 50 },     // $0.10 / $0.50 (prompts under 100K tokens)
  "claude-sonnet-5-5": { id: "claude-sonnet-5-5", provider: "anthropic", inputPerM: 200, outputPerM: 1000 }, // $2 / $10
};

/** Fixed per-task routing (level 1). Escalation: one step up after a failed repair. */
export const ROUTING: Record<Task, { model: string; escalateTo?: string; maxTokens: number }> = {
  planning: { model: "claude-sonnet-5-5", maxTokens: 12000 },
  source_extraction: { model: "claude-haiku-5-5", escalateTo: "claude-sonnet-5-5", maxTokens: 6000 },
  self_check: { model: "claude-haiku-5-5", escalateTo: "claude-sonnet-5-5", maxTokens: 3000 },
  preference_learning: { model: "claude-haiku-5-5", escalateTo: "claude-sonnet-5-5", maxTokens: 2000 },
};

export function creditsFor(model: string, inputTokens: number, outputTokens: number): number {
  const m = MODELS[model];
  if (!m) return 0;
  return (inputTokens * m.inputPerM + outputTokens * m.outputPerM) / 1_000_000;
}
