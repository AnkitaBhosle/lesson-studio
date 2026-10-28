import { NextResponse } from "next/server";
import { FlowError } from "@ls/orchestrator";
import type { Repo } from "@ls/schema";
import { loadSession, NoAccess, type Session } from "./server";

type Ctx<P> = { params: Promise<P> };
type Handler<P> = (repo: Repo, params: P, body: Record<string, unknown>, userId: string, s: Session) => unknown;

/** Wraps a route: gives it this workspace's repository, parses JSON, saves, and turns flow errors into plain messages. */
export function route<P>(fn: Handler<P>, opts: { liveOnly?: boolean } = {}) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const s = await loadSession();
      if (opts.liveOnly && s.mode !== "live") throw new FlowError("Switch back to your own lessons to do this.");
      const text = req.method === "GET" ? "" : await req.text();
      const body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      const result = await fn(s.repo, await ctx.params, body, s.user.id, s);
      await s.save();
      return NextResponse.json(result ?? { ok: true });
    } catch (e) {
      if (e instanceof NoAccess) return NextResponse.json({ error: "Enter your access code first." }, { status: 401 });
      if (e instanceof FlowError) return NextResponse.json({ error: e.message, ...(req.headers.get("x-ls-debug") && e.detail ? { detail: e.detail } : {}) }, { status: e.status });
      console.error("[api]", req.method, req.url, e);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export const str = (v: unknown) => (typeof v === "string" ? v : "");
