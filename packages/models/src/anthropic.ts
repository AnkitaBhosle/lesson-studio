import Anthropic from "@anthropic-ai/sdk";

/** The only place the Anthropic SDK is called. */
let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 110_000 }));

export const anthropicConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

export interface ToolCallResult { input: unknown; inputTokens: number; outputTokens: number; stopReason: string | null }

/** One call that must answer by filling in a single tool (structured output). */
export async function callTool(args: {
  model: string; system: string; user: string; maxTokens: number;
  toolName: string; toolDescription: string; inputSchema: Record<string, unknown>;
}): Promise<ToolCallResult> {
  const res = await getClient().messages.create({
    model: args.model,
    max_tokens: args.maxTokens,
    system: args.system,
    messages: [{ role: "user", content: args.user }],
    tools: [{ name: args.toolName, description: args.toolDescription, input_schema: args.inputSchema as Anthropic.Tool.InputSchema }],
    tool_choice: { type: "tool", name: args.toolName },
  });
  const block = res.content.find((b) => b.type === "tool_use");
  return {
    input: block && block.type === "tool_use" ? block.input : undefined,
    inputTokens: res.usage.input_tokens,
    outputTokens: res.usage.output_tokens,
    stopReason: res.stop_reason,
  };
}
