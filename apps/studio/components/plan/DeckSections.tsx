"use client";
import { useState } from "react";
import type { Slide } from "@ls/schema";
import { changedLabel, FlagBox } from "./VideoSlides";
import type { Api, PlanView } from "./PlanEditor";

interface Section { title: string; slides: Slide[]; recap: boolean }

function group(slides: Slide[]): Section[] {
  const out: Section[] = [];
  for (const s of slides) {
    const title = s.section ?? "Opening";
    const last = out[out.length - 1];
    if (last && last.title === title) last.slides.push(s);
    else out.push({ title, slides: [s], recap: Boolean(s.fromRecap) });
  }
  return out;
}

export function DeckSections({ view, api }: { view: PlanView; api: Api }) {
  const sections = group(view.plan.slides);
  const minutesPerSlide = 50 / Math.max(view.plan.slides.length, 1);
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const flagged = sections.filter((s) => s.recap || s.slides.some((x) => x.claims.some((c) => c.status === "general_knowledge_flagged")));
    return Object.fromEntries((flagged.length ? flagged : sections.slice(1, 2)).map((s) => [s.title, true]));
  });
  return (
    <div className="stack" style={{ gap: 10 }}>
      {sections.map((sec, i) => {
        const isOpen = Boolean(open[sec.title]);
        const mins = Math.max(1, Math.round(sec.slides.length * minutesPerSlide));
        return (
          <div key={sec.title} className="section">
            <button className="sechead" type="button" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [sec.title]: !isOpen })}>
              <span className="row" style={{ gap: 10 }}>
                <span className="slide-num">{i + 1}</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{sec.title}</span>
                {sec.recap && <span className="tag tag-ok">Recap from {view.recapFrom ?? "an earlier lesson"}</span>}
              </span>
              <span className="muted" style={{ fontSize: 13 }}>{sec.slides.length} {sec.slides.length === 1 ? "slide" : "slides"} · {mins} min</span>
            </button>
            {isOpen && (
              <div className="sec-body">
                {sec.slides.map((s) => <DeckSlideCard key={`${s.slideId}-${view.plan.version}`} slide={s} view={view} api={api} />)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeckSlideCard({ slide: s, view, api }: { slide: Slide; view: PlanView; api: Api }) {
  const [editing, setEditing] = useState(false);
  const [points, setPoints] = useState(s.bullets.join("\n"));
  const [sees, setSees] = useState(s.visual);
  const label = changedLabel(s, view.plan.version);

  async function toggle() {
    if (editing && (points !== s.bullets.join("\n") || sees !== s.visual)) {
      await api.call("PATCH", `/api/lessons/${view.lessonId}/slides/${s.slideId}`, { bullets: points.split("\n"), visual: sees });
    }
    setEditing(!editing);
  }

  return (
    <article className="deck-slide" id={s.slideId}>
      <div className="row-between">
        <div className="row" style={{ gap: 8 }}>
          <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>{s.order}</span>
          <h3 style={{ margin: 0, fontSize: 15 }}>{s.title}</h3>
          {label && <span className="tag tag-ok">{label}</span>}
        </div>
        <span className="row" style={{ gap: 6 }}>
          {s.visualType === "generated_clip" && <span className="tag">Short clip to play in class</span>}
          {s.role === "question" && <span className="tag">Check for understanding</span>}
          {view.editable && <button className="act" type="button" onClick={toggle} disabled={api.pending}>{editing ? "Done" : "Edit"}</button>}
        </span>
      </div>
      {editing ? (
        <div className="grid-2">
          <label className="stack" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>Key points
            <textarea className="field" rows={3} value={points} onChange={(e) => setPoints(e.target.value)} />
          </label>
          <label className="stack" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>Visual
            <textarea className="field" rows={3} value={sees} onChange={(e) => setSees(e.target.value)} />
          </label>
        </div>
      ) : (
        <div className="stack" style={{ gap: 4 }}>
          <p>{s.bullets.join(" · ")}</p>
          <p><strong>Visual:</strong> {s.visual}</p>
          {s.speakerNotes && <p><strong>Speaker notes:</strong> {s.speakerNotes}</p>}
        </div>
      )}
      {view.cite[s.slideId] && <span className="muted" style={{ fontSize: 13 }}>Source: {view.cite[s.slideId]}</span>}
      <FlagBox slide={s} view={view} api={api} />
    </article>
  );
}
