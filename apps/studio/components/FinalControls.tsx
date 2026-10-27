"use client";
import { useState } from "react";
import { useCall } from "@/lib/client";
import { Switch } from "./Switch";

/** Export and sharing buttons. In the demo the media are previews, so these explain rather than download. */
export function DemoButton({ children, primary, link }: { children: React.ReactNode; primary?: boolean; link?: boolean }) {
  const [said, setSaid] = useState(false);
  return (
    <span className="stack" style={{ gap: 4 }}>
      <button type="button" className={link ? "lnk" : `btn ${primary ? "btn-primary" : "btn-ghost"}`} onClick={() => setSaid(true)}>{children}</button>
      {said && <span role="status" className="muted" style={{ fontSize: 12, maxWidth: 220 }}>This demo shows previews; files arrive with real media.</span>}
    </span>
  );
}

interface CardSource { id: string; name: string; kind: string; cited: boolean; privateNote: boolean }

export function SourcesCardPanel({ lessonId, show, sources, checked }: { lessonId: string; show: boolean; sources: CardSource[]; checked: string[] }) {
  const { call, pending, error } = useCall();
  const save = (ids: string[], s = show) => call("PUT", `/api/lessons/${lessonId}/sources-card`, { show: s, sourceIds: ids });
  const cited = sources.filter((s) => s.cited).map((s) => s.id);
  return (
    <div className="card">
      <div className="stack" style={{ gap: 4 }}>
        <h2 style={{ fontSize: 17 }}>Sources card at the end of the video</h2>
        <p className="muted" style={{ margin: 0, fontSize: 14 }}>You choose what viewers see. Private notes are never shown unless you turn them on.</p>
      </div>
      {sources.map((s) => (
        <div key={s.id} className="row-between" style={{ borderTop: "1px solid #EEF0F4", paddingTop: 8 }}>
          <span className="stack" style={{ gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</span>
            <span style={{ fontSize: 13, color: s.cited ? "var(--accent-hover)" : "var(--muted)" }}>{s.privateNote ? "Private note" : s.kind} · {s.cited ? "shown to viewers" : "not shown"}</span>
          </span>
          <Switch checked={s.cited} disabled={pending || !show} label={`Show ${s.name} on the sources card`} onChange={(v) => save(v ? [...cited, s.id] : cited.filter((x) => x !== s.id))} />
        </div>
      ))}
      {checked.map((t) => (
        <div key={t} className="stack" style={{ gap: 2, borderTop: "1px solid #EEF0F4", paddingTop: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{t}</span>
          <span className="muted" style={{ fontSize: 13 }}>General knowledge, checked by you · not a source</span>
        </div>
      ))}
      <label className="row" style={{ fontSize: 14, minHeight: 44, cursor: "pointer" }}>
        <input type="checkbox" checked={!show} disabled={pending} onChange={(e) => save(cited, !e.target.checked)} style={{ width: 20, height: 20 }} />
        Leave the sources card out of this video
      </label>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
