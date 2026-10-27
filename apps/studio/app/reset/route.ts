import { NextResponse, type NextRequest } from "next/server";
import { resetGuided } from "@ls/orchestrator";
import { loadSession } from "@/lib/server";

/** Restores the guided demo for this code. Live lessons are never touched. */
export async function POST(req: NextRequest) {
  const s = await loadSession().catch(() => null);
  if (s) await resetGuided(s.code);
  return NextResponse.redirect(new URL("/", req.url), 303);
}
