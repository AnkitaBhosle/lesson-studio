"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnterForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/access", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "That code didn't work.");
    router.push("/");
    router.refresh();
  }
  return (
    <form className="stack" style={{ gap: 10 }} onSubmit={submit}>
      <label htmlFor="code" style={{ fontSize: 14, fontWeight: 600 }}>Access code</label>
      <input id="code" className="field" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. RW-K7Q-M9P" style={{ fontSize: 16, letterSpacing: 0.5 }} />
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy || !code.trim()}>Open Lesson Studio</button>
    </form>
  );
}
