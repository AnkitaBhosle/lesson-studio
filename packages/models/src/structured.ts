import { z } from "zod";
import { anthropicConfigured, callTool } from "./anthropic";
import { creditsFor, ROUTING, type Task } from "./routing";

/** What the caller records for each paid call (CostEvent) and each step (AgentRun). */
export interface CallLog {
  step: (kind: "llm" | "validation" | "escalation", detail: string) => void;
  cost: (e: { model: string; inputTokens: number; outputTokens: number; credits: number }) => Promise<void>;
}

/** Runs before every paid call; throws to stop it (spend gate). */
export type Gate = () => Promise<void>;

export class StructuredOutputError extends Error {}

export const liveModelsAvailable = () => anthropicConfigured();

/**
 * Structured output with repair and escalation (Spec 03 §0.2, §0.3b):
 * call → validate with zod → on failure one repair on the same model → one try on the next model up.
 */
export async function callStructured<T>(args: {
  task: Task; system: string; user: string; schema: z.ZodType<T>; toolName: string; toolDescription: string;
  gate: Gate; log: CallLog; validate?: (value: T) => string | null;
}): Promise<{ value: T; model: string; escalatedFrom?: string }> {
  const route = ROUTING[args.task];
  const inputSchema = z.toJSONSchema(args.schema, { target: "draft-7" }) as Record<string, unknown>;
  const attempts: { model: string; repair?: string }[] = [{ model: route.model }];
  let lastError = "";
  for (let i = 0; i < 3; i++) {
    const attempt = attempts[i];
    if (!attempt) break;
    await args.gate();
    const user = attempt.repair ? `${args.user}\n\nYour previous answer didn't fit the required shape: ${attempt.repair}\nAnswer again, fixing only that.` : args.user;
    const res = await callTool({ model: attempt.model, system: args.system, user, maxTokens: route.maxTokens, toolName: args.toolName, toolDescription: args.toolDescription, inputSchema });
    await args.log.cost({ model: attempt.model, inputTokens: res.inputTokens, outputTokens: res.outputTokens, credits: creditsFor(attempt.model, res.inputTokens, res.outputTokens) });
    args.log.step("llm", `${args.task} on ${attempt.model}: ${res.inputTokens} in, ${res.outputTokens} out${res.stopReason === "max_tokens" ? ", cut off" : ""}`);
    const parsed = args.schema.safeParse(res.input);
    const problem = parsed.success ? args.validate?.(parsed.data) ?? null : parsed.error.issues.slice(0, 5).map((x) => `${x.path.join(".")}: ${x.message}`).join("; ");
    if (parsed.success && !problem) {
      args.log.step("validation", "passed");
      return { value: parsed.data, model: attempt.model, escalatedFrom: i > 0 && attempt.model !== route.model ? route.model : undefined };
    }
    lastError = problem ?? "invalid";
    args.log.step("validation", `failed: ${lastError.slice(0, 300)}`);
    if (i === 0) attempts.push({ model: attempt.model, repair: lastError });
    else if (i === 1 && route.escalateTo) { attempts.push({ model: route.escalateTo, repair: lastError }); args.log.step("escalation", `to ${route.escalateTo}`); }
  }
  throw new StructuredOutputError(lastError);
}
