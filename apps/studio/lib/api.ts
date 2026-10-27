import { NextResponse } from "next/server";
import { FlowError } from "@ls/orchestrator";
import type { Repo } from "@ls/schema";
import { session } from "./server";

type Ctx<P> = { params: Promise<P> };

/** Wraps a route: gives it this visitor's repository, parses JSON, and turns flow errors into plain messages. */
export function route<P>(fn: (repo: Repo, params: P, body: Record<string, unknown>, userId: string) => unknown) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      const { repo, user } = await session();
      const text = req.method === "GET" ? "" : await req.text();
      const body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      const result = await fn(repo, await ctx.params, body, user.id);
      return NextResponse.json(result ?? { ok: true });
    } catch (e) {
      if (e instanceof FlowError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error("[api]", req.method, req.url, e);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export const str = (v: unknown) => (typeof v === "string" ? v : "");
