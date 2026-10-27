import { updateCode } from "@ls/orchestrator";
import { adminRoute } from "@/lib/admin";

export const PATCH = adminRoute<{ code: string }>(async (req, { code }) => {
  const body = (await req.json().catch(() => ({}))) as { label?: string; active?: boolean; capDollars?: number };
  return updateCode(code, { label: body.label, active: body.active, capCredits: body.capDollars !== undefined ? Math.round(body.capDollars * 100) : undefined });
});
