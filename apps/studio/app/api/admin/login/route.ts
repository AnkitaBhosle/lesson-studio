import { NextResponse } from "next/server";
import { isAdmin } from "@ls/orchestrator";
import { tooManyTries } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (await tooManyTries(`admin:${ip}`, 5, 900)) return NextResponse.json({ error: "Too many tries" }, { status: 429 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!isAdmin(token)) return NextResponse.json({ error: "Wrong token" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ls_admin", token!, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
