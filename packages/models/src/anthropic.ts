import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

/** The only place the Anthropic SDK is called. */
let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 170_000 }));

export const anthropicConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export interface JsonCallResult { output: unknown; inputTokens: number; outputTokens: number; stopReason: string | null }

/** One call that must answer as JSON matching the schema (structured outputs). Validation stays with the caller. */
export async function callJson(args: { model: string; system: string; user: string; maxTokens: number; schema: z.ZodType }): Promise<JsonCallResult> {
  const format = zodOutputFormat(args.schema as never);
  const res = await getClient().messages.create({
    model: args.model,
    max_tokens: args.maxTokens,
    system: args.system,
    messages: [{ role: "user", content: args.user }],
    output_config: { format: { type: "json_schema", schema: format.schema } },
  });
  const text = res.content.filter((b) => b.type === "text").map((b) => (b.type === "text" ? b.text : "")).join("");
  let output: unknown;
  try { output = JSON.parse(text); } catch { output = undefined; }
  return { output, inputTokens: res.usage.input_tokens, outputTokens: res.usage.output_tokens, stopReason: res.stop_reason };
}
