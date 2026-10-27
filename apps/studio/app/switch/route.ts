import { NextResponse, type NextRequest } from "next/server";
import { GUIDED_USERS } from "@/lib/server";

const LANDING: Record<string, string> = { usr_maya: "/", usr_ortiz: "/courses/crs_bio101" };
const YEAR = 60 * 60 * 24 * 365;

/** Switches the guided demo between Maya and Dr. Ortiz (and into guided mode). */
export function GET(req: NextRequest) {
  // Ignore router prefetches: only a real click switches the demo user.
  if (req.headers.get("next-router-prefetch") || req.nextUrl.searchParams.has("_rsc")) return new NextResponse(null, { status: 204 });
  const to = req.nextUrl.searchParams.get("to") ?? "usr_maya";
  const user = GUIDED_USERS.includes(to as never) ? to : "usr_maya";
  const res = NextResponse.redirect(new URL(LANDING[user] ?? "/", req.url));
  res.cookies.set("ls_user", user, { sameSite: "lax", path: "/", maxAge: YEAR });
  res.cookies.set("ls_mode", "guided", { sameSite: "lax", path: "/", maxAge: YEAR });
  return res;
}
