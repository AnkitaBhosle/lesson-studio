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
  return { call, pending, error };
}
