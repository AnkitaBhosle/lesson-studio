import { NextResponse, type NextRequest } from "next/server";
import { resetDemo } from "@ls/orchestrator";

export function POST(req: NextRequest) {
  resetDemo(req.cookies.get("ls_vid")?.value ?? "local");
  return NextResponse.redirect(new URL("/", req.url), 303);
}
