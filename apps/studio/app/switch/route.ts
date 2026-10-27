import { NextResponse, type NextRequest } from "next/server";
import { USERS } from "@/lib/server";

const LANDING: Record<string, string> = { usr_maya: "/", usr_ortiz: "/courses/crs_bio101" };

export function GET(req: NextRequest) {
  // Ignore router prefetches: only a real click switches the demo user.
  if (req.headers.get("next-router-prefetch") || req.nextUrl.searchParams.has("_rsc")) return new NextResponse(null, { status: 204 });
  const to = req.nextUrl.searchParams.get("to") ?? "usr_maya";
  const user = USERS.includes(to as never) ? to : "usr_maya";
  const res = NextResponse.redirect(new URL(LANDING[user] ?? "/", req.url));
  res.cookies.set("ls_user", user, { sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
