import { route, str } from "@/lib/api";

// Dictation stub: returns a fixed transcript per context. Real speech-to-text arrives with the model layer.
const FIXTURES: Record<string, string> = {
  plan: "Make the hook punchier and keep it under two and a half minutes.",
  story: "I'd start with my own first purchase, then explain why it worked.",
  lecture: "Spend less time on the Calvin cycle and add a quick demo with a leaf in water.",
};

export const POST = route((_repo, _p, body) => ({ text: FIXTURES[str(body.context)] ?? FIXTURES.plan }));
