import { createCode, listCodes } from "@ls/orchestrator";
import { adminRoute } from "@/lib/admin";

export const GET = adminRoute(async () => listCodes());
export const POST = adminRoute(async (req) => {
  const body = (await req.json().catch(() => ({}))) as { label?: string; code?: string; prefix?: string; capDollars?: number };
  return createCode({ label: body.label ?? "", code: body.code || undefined, prefix: body.prefix, capCredits: body.capDollars ? Math.round(body.capDollars * 100) : undefined });
});
