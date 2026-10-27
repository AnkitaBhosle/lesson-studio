import { NextResponse } from "next/server";

/** Switches between your own lessons (live) and the guided demo. */
export async function POST(req: Request) {
  const { mode } = (await req.json().catch(() => ({}))) as { mode?: string };
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ls_mode", mode === "guided" ? "guided" : "live", { sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}
