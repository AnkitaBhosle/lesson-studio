import { NextResponse } from "next/server";
import { activeCode, signCode } from "@ls/orchestrator";
import { tooManyTries } from "@/lib/rateLimit";

const YEAR = 60 * 60 * 24 * 365;

/** Checks an access code and remembers it in this browser. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (await tooManyTries(`access:${ip}`, 10, 600)) return NextResponse.json({ error: "Too many tries. Wait a few minutes and try again." }, { status: 429 });
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const found = code ? await activeCode(code) : null;
  if (!found) return NextResponse.json({ error: "That code didn't work. Check it and try again." }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("ls_code", signCode(found.code), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: YEAR });
  res.cookies.set("ls_mode", "live", { sameSite: "lax", path: "/", maxAge: YEAR });
  return res;
}
