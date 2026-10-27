import { NextResponse, type NextRequest } from "next/server";
import { verifySignedCode } from "@ls/orchestrator/signing";

/**
 * Nothing but the Enter screen (and the owner's admin page) is reachable without a
 * genuine access-code cookie. Whether the code is still active is checked per request
 * in lib/server.ts, where storage is available.
 */
const OPEN = [/^\/enter$/, /^\/api\/access$/, /^\/admin$/, /^\/api\/admin(\/|$)/];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (OPEN.some((re) => re.test(pathname))) return NextResponse.next();
  if (verifySignedCode(request.cookies.get("ls_code")?.value)) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Enter your access code first." }, { status: 401 });
  return NextResponse.redirect(new URL("/enter", request.url));
}

export const config = { matcher: ["/((?!_next/|favicon.ico).*)"] };
