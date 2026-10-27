"use client";
import type { Source } from "@ls/schema";
import { useCall } from "@/lib/client";
import { sourceKind } from "@/lib/labels";
import { Switch } from "./Switch";

export function SourceCard({ source: s, audience }: { source: Source; audience: "viewers" | "students" }) {
  const { call, error } = useCall();
  const cited = s.visibility === "cited";
  const facts = s.digest?.quotableFacts.length ?? 0;
  const figures = s.digest?.figures.length ?? 0;
  const kind = s.kind === "suggested" ? "Suggested · approved by you" : s.kind === "pdf" ? "PDF · assigned reading" : sourceKind(s);
  return (
    <article className="card">
      <div className="row-between">
        <div className="row" style={{ gap: 10 }}><span className="tag">{kind}</span><h3>{s.title}</h3></div>
        <span className="ok-text" style={{ fontSize: 13 }}>{facts} facts{figures ? ` · ${figures} figures` : ""}</span>
      </div>
      {s.digest && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--text-2)" }}>{s.digest.summary}</p>}
      {s.kind === "voice_memo" && s.digest?.quotableFacts[0] && <blockquote className="note-box" style={{ margin: 0 }}>“{s.digest.quotableFacts[0].text}”</blockquote>}
      <div className="card-foot">
        <span style={{ fontSize: 13, lineHeight: 1.45, fontWeight: 600, color: cited ? "var(--accent-hover)" : "var(--muted)" }}>
          {cited ? `Cited: ${audience} see this source at the end` : `Private: used to plan, never shown to ${audience}`}
        </span>
        <Switch checked={cited} label={`Cite ${s.title} in the lesson`} onChange={(v) => call("PUT", `/api/sources/${s.id}/visibility`, { visibility: v ? "cited" : "private" })}>Cite in the lesson</Switch>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </article>
  );
}

export function SuggestedSource({ lessonId, source }: { lessonId: string; source: Source }) {
  const { call, pending } = useCall();
  const topic = `${source.digest?.keyConcepts[0]?.name ?? "this topic"} plants`;
  const decide = (use: boolean) => call("POST", `/api/lessons/${lessonId}/sources/${source.id}/decision`, { use });
  return (
    <div className="warn-box">
      <p style={{ margin: 0 }}><strong>One gap.</strong> Your notes mention {topic}, but your readings don&apos;t explain them.</p>
      <p style={{ margin: 0 }}>I found an openly licensed textbook section that covers it. Use it as a source?</p>
      <div className="stack" style={{ gap: 8 }}>
        <button className="btn btn-ghost btn-sm" type="button" disabled={pending} onClick={() => decide(true)}>Use this source</button>
        <button className="btn btn-ghost btn-sm" type="button" disabled={pending} onClick={() => decide(false)}>Skip {topic}</button>
      </div>
    </div>
  );
}
