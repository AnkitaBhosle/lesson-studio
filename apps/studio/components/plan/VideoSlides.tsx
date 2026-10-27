"use client";
import { useState } from "react";
import type { Slide } from "@ls/schema";
import { clock, needsCheck, wasChecked } from "@/lib/labels";
import { Grip } from "../icons";
import type { Api, PlanView } from "./PlanEditor";

export function changedLabel(s: Slide, version: number): string | null {
  if (!s.changedInVersion) return null;
  const when = s.changedInVersion === version ? "" : ` in draft ${s.changedInVersion}`;
  if (s.changeReason === "teacher_edit") return `Edited by you${when}`;
  if (s.changeReason === "slide_rewrite") return `Rewritten from your note${when}`;
  return `Changed in draft ${s.changedInVersion}`;
}

export function FlagBox({ slide, view, api }: { slide: Slide; view: PlanView; api: Api }) {
  if (needsCheck(slide)) {
    return (
      <div className="warn-box" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
        <span><strong>Please check:</strong> this part isn&apos;t in your {view.format === "lecture_deck" ? "readings" : "sources"}. I drafted it from general knowledge.</span>
        <button className="btn btn-ghost btn-sm" type="button" disabled={api.pending} onClick={() => api.call("POST", `/api/lessons/${view.lessonId}/slides/${slide.slideId}/confirm`)}>Looks right</button>
      </div>
    );
  }
  if (wasChecked(slide)) return <div className="row ok-text" style={{ fontSize: 14 }}>✓ Checked by you</div>;
  return null;
}

export function VideoSlides({ view, api }: { view: PlanView; api: Api }) {
  let t = 0;
  return (
    <>
      {view.plan.slides.map((s) => {
        const start = t;
        t += s.estDurationSec ?? 0;
        return <VideoSlide key={`${s.slideId}-${view.plan.version}`} slide={s} time={`${clock(start)}–${clock(t)}`} view={view} api={api} />;
      })}
    </>
  );
}

function VideoSlide({ slide: s, time, view, api }: { slide: Slide; time: string; view: PlanView; api: Api }) {
  const [editing, setEditing] = useState(false);
  const [said, setSaid] = useState(s.narrative ?? "");
  const [sees, setSees] = useState(s.visual);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState("");
  const label = changedLabel(s, view.plan.version);
  const base = `/api/lessons/${view.lessonId}`;

  async function doneEditing() {
    if (said !== (s.narrative ?? "") || sees !== s.visual) await api.call("PATCH", `${base}/slides/${s.slideId}`, { narrative: said, visual: sees });
    setEditing(false);
  }
  async function rewrite() {
    if (await api.call("POST", `${base}/plan/revise`, { text: note, via: "typed", slideId: s.slideId })) { setAsking(false); setNote(""); }
  }

  return (
    <article className="card" id={s.slideId}>
      <div className="row-between">
        <div className="row" style={{ gap: 10 }}>
          <Grip />
          <span className="slide-num">{s.order}</span>
          <h3>{s.title}</h3>
          {label && <span className="tag tag-ok">{label}</span>}
        </div>
        <span className="muted" style={{ fontSize: 13 }}>{time}</span>
      </div>
      {editing ? (
        <div className="grid-2">
          <label className="stack eyebrow" style={{ gap: 6 }}>Narrative
            <textarea className="field" rows={4} value={said} onChange={(e) => setSaid(e.target.value)} style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }} />
          </label>
          <label className="stack eyebrow" style={{ gap: 6 }}>Visual
            <textarea className="field" rows={4} value={sees} onChange={(e) => setSees(e.target.value)} style={{ textTransform: "none", letterSpacing: 0, fontWeight: 400 }} />
          </label>
        </div>
      ) : (
        <div className="grid-2">
          <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Narrative</span><p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{s.narrative}</p></div>
          <div className="stack" style={{ gap: 4 }}><span className="eyebrow">Visual</span><p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "var(--text-2)" }}>{s.visual}</p></div>
        </div>
      )}
      {(view.from[s.slideId]?.length ?? 0) > 0 && (
        <div className="row" style={{ fontSize: 13 }}><span className="muted">From:</span>{view.from[s.slideId]!.map((f) => <span key={f} className="src-chip">{f}</span>)}</div>
      )}
      <FlagBox slide={s} view={view} api={api} />
      {asking && (
        <div className="row">
          <label className="visually-hidden" htmlFor={`ask-${s.slideId}`}>What should change in this slide?</label>
          <input id={`ask-${s.slideId}`} className="field" style={{ flex: "1 1 320px", width: "auto" }} placeholder="What should change? e.g. “shorter, and use a coffee example”" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="button" onClick={rewrite} disabled={api.pending || !note.trim()}>Rewrite slide</button>
        </div>
      )}
      {view.editable && (
        <div className="row" style={{ gap: 6, paddingTop: 12, borderTop: "1px solid #EEF0F4" }}>
          <button className="act" type="button" onClick={editing ? doneEditing : () => setEditing(true)} disabled={api.pending}>{editing ? "Done editing" : "Edit"}</button>
          <button className="act" type="button" aria-expanded={asking} onClick={() => setAsking(!asking)}>Ask to change</button>
          <button className="act" type="button" onClick={() => api.call("DELETE", `/api/lessons/${view.lessonId}/slides/${s.slideId}`)} disabled={api.pending}>Remove</button>
        </div>
      )}
    </article>
  );
}
