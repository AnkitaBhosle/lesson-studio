import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FlowError, isAdmin } from "@ls/orchestrator";

/** Owner-only: a Bearer ADMIN_TOKEN header, or the cookie set by the admin page's sign-in. */
export async function adminAllowed(req?: Request): Promise<boolean> {
  const bearer = req?.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer && isAdmin(bearer)) return true;
  return isAdmin((await cookies()).get("ls_admin")?.value);
}

export function adminRoute<P>(fn: (req: Request, params: P) => Promise<unknown>) {
  return async (req: Request, ctx: { params: Promise<P> }) => {
    if (!(await adminAllowed(req))) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
    try {
      return NextResponse.json((await fn(req, await ctx.params)) ?? { ok: true });
    } catch (e) {
      if (e instanceof FlowError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error("[admin]", req.method, req.url, e);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}
