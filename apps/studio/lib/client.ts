"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

/** Calls an API route, then refreshes the server-rendered page. */
export function useCall() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  async function call<T = unknown>(method: string, url: string, body?: unknown): Promise<T | null> {
    setError(null);
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return null; }
    start(() => router.refresh());
    return data;
  }
  const [waiting, setWaiting] = useState(false);
  /** Starts planning work. Live planning runs in the background, so this waits for it by polling. */
  async function plan(lessonId: string, path: "plan" | "plan/revise", body?: unknown): Promise<{ summary?: string } | null> {
    setWaiting(true);
    try {
      const started = await call<{ runId?: string; summary?: string }>("POST", `/api/lessons/${lessonId}/${path}`, body);
      if (!started?.runId) return started;
      const deadline = Date.now() + 7 * 60_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 3000));
        const res = await fetch(`/api/lessons/${lessonId}/plan/runs/${started.runId}`).catch(() => null);
        if (!res) continue;
        const st = (await res.json().catch(() => ({}))) as { state?: string; summary?: string; error?: string };
        if (!res.ok) { setError(st.error ?? "Something went wrong. Please try again."); return null; }
        if (st.state === "ready") { start(() => router.refresh()); return { summary: st.summary }; }
        if (st.state === "failed") { setError(st.error ?? "I couldn't finish the plan. Please try again."); start(() => router.refresh()); return null; }
      }
      setError("That took too long. Please try again.");
      return null;
    } finally {
      setWaiting(false);
    }
  }
  return { call, plan, pending: pending || waiting, error };
}
