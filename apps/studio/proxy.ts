import { NextResponse, type NextRequest } from "next/server";

/** Gives every visitor their own copy of the demo (see packages/orchestrator/src/store.ts). */
export function proxy(request: NextRequest) {
  if (request.cookies.get("ls_vid")) return NextResponse.next();
  const id = crypto.randomUUID();
  const headers = new Headers(request.headers);
  headers.set("cookie", [request.headers.get("cookie"), `ls_vid=${id}`].filter(Boolean).join("; "));
  const res = NextResponse.next({ request: { headers } });
  res.cookies.set("ls_vid", id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export const config = { matcher: ["/((?!_next/|favicon.ico).*)"] };
