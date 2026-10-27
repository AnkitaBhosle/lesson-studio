"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Arrow } from "./icons";

interface StarterCard { id: string; name: string; kind: string; color: string; blurb: string; buildable: boolean; audience: string; template: { name: string; primary: string; accent: string } }
interface Row { id: string; title: string; href: string; status: { text: string; tone: string } }

/** Home in live mode: start a real lesson from a topic and a Starter. */
export function LiveHome({ starters, lessons }: { starters: StarterCard[]; lessons: Row[] }) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [starterId, setStarterId] = useState(starters.find((s) => s.buildable)!.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chosen = starters.find((s) => s.id === starterId)!;

  async function start(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/lessons", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic, starterId }) });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
    if (!res.ok || !data.id) { setBusy(false); return setError(data.error ?? "Something went wrong. Please try again."); }
    router.push(`/lessons/${data.id}/sources`);
  }

  return (
    <>
      <section className="stack" style={{ gap: 16 }}>
        <h1 style={{ fontSize: 34 }}>What are you teaching?</h1>
        <p className="muted" style={{ margin: 0, fontSize: 16 }}>Tell me the topic and who it&apos;s for. I&apos;ll set up the rest, and you can change anything.</p>
        <form className="topic" onSubmit={start}>
          <label htmlFor="topic" className="visually-hidden">Topic and audience</label>
          <input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. How vaccines train the immune system, for 9th graders" />
          <button className="btn btn-primary" type="submit" disabled={busy || topic.trim().length < 3}>Start lesson <Arrow /></button>
        </form>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="card" style={{ gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Here&apos;s how I&apos;d set this up</div>
          <div className="grid-3">
            <div className="setup-cell"><span className="eyebrow">Making</span><span style={{ fontWeight: 600 }}>{chosen.name}</span><span className="muted" style={{ fontSize: 13 }}>Pick a Starter below to change</span></div>
            <div className="setup-cell"><span className="eyebrow">For</span><span style={{ fontWeight: 600 }}>{chosen.audience}</span><span className="muted" style={{ fontSize: 13 }}>You can refine this in the plan</span></div>
            <div className="setup-cell"><span className="eyebrow">Looks like</span>
              <span className="row" style={{ fontWeight: 600 }}><span aria-hidden="true" className="row" style={{ gap: 3 }}>{[chosen.template.primary, chosen.template.accent].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />)}</span>{chosen.template.name}</span>
              <Link href="/templates" style={{ fontSize: 13 }}>See templates</Link></div>
          </div>
        </div>
      </section>

      <section className="stack" style={{ gap: 14 }}>
        <h2>Or start from a Starter</h2>
        <div className="grid-3" style={{ gap: 14 }}>
          {starters.map((s) => (
            <button key={s.id} type="button" className="starter" aria-pressed={s.id === starterId} aria-disabled={!s.buildable} disabled={!s.buildable}
              onClick={() => { setStarterId(s.id); document.getElementById("topic")?.focus(); }}
              style={s.id === starterId ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" } : undefined}>
              <span className="eyebrow" style={{ color: s.color }}>{s.kind}</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</span>
              <span className="muted" style={{ fontSize: 14 }}>{s.blurb}</span>
              {!s.buildable && <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Coming soon</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="stack" style={{ gap: 14 }}>
        <h2>Your lessons</h2>
        {lessons.length === 0 ? (
          <div className="card"><p className="muted" style={{ margin: 0, fontSize: 15 }}>Nothing here yet. Start with a topic above, or try the guided demo at the top to see two finished examples first.</p></div>
        ) : (
          <div className="list">
            {lessons.map((l) => (
              <Link key={l.id} className="list-row" href={l.href}>
                <span style={{ fontWeight: 600 }}>{l.title}</span>
                <span className={`pill pill-${l.status.tone}`}>{l.status.text}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
