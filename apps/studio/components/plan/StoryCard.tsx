"use client";
import { useState } from "react";
import { Mic } from "../icons";
import type { Api, Dictation, PlanView } from "./PlanEditor";

export function StoryCard({ view, api, dictation }: { view: PlanView; api: Api; dictation: Dictation }) {
  const { plan, lessonId, editable } = view;
  const deck = view.format === "lecture_deck";
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(plan.story);
  const [anglesOpen, setAnglesOpen] = useState(false);
  const [picked, setPicked] = useState(false);
  const url = `/api/lessons/${lessonId}/story`;

  async function toggleEdit() {
    if (editing && text.trim() && text !== plan.story) await api.call("PATCH", url, { story: text });
    if (!editing) setText(plan.story);
    setEditing(!editing);
  }
  async function pick(angleId: string) {
    if (angleId === plan.chosenAngleId) return setAnglesOpen(false);
    if (await api.call("PATCH", url, { angleId })) { setPicked(true); setAnglesOpen(false); }
  }

  return (
    <div className="card" style={{ padding: "20px 22px", gap: 14 }}>
      <div className="stack" style={{ gap: 8 }}>
        <div className="row-between">
          <h2 className="eyebrow" style={{ fontSize: 13 }}>{deck ? "The story of this lecture" : "The story of this lesson"}</h2>
          {editable && (
            <div className="row" style={{ gap: 6 }}>
              <button className="act" type="button" onClick={toggleEdit} disabled={api.pending}>{editing ? "Done" : "Edit"}</button>
              <button className="act" type="button" onClick={dictation.listening ? dictation.stop : dictation.start}><Mic />Dictate</button>
              <button className="act" type="button" aria-expanded={anglesOpen} onClick={() => setAnglesOpen(!anglesOpen)}>Explore angles</button>
            </div>
          )}
        </div>
        {editing ? (
          <label className="stack" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>Edit the story
            <textarea className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </label>
        ) : <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>{plan.story}</p>}
        {dictation.listening && (
          <div className="listening" role="status">
            <span aria-hidden="true" className="dot" />
            {deck ? "Listening. Talk through your lecture the way you'd teach it, and I'll turn it into the outline." : "Listening. Talk through how you'd tell it, and I'll rewrite the story and the slides to match."}
            <button className="act" type="button" onClick={dictation.stop}>Stop</button>
          </div>
        )}
        {anglesOpen && (
          <div className="grid-3" style={{ gap: 10 }}>
            {plan.angles.map((a) => (
              <button key={a.angleId} type="button" className="angle" aria-pressed={a.angleId === plan.chosenAngleId} onClick={() => pick(a.angleId)} disabled={api.pending}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{a.label}{a.angleId === plan.chosenAngleId ? " (current)" : ""}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-2)" }}>{a.story}</span>
              </button>
            ))}
          </div>
        )}
        {picked && <span className="ok-text" style={{ fontSize: 13 }}>New story picked. {deck ? "I'll reorder the sections to match when you approve." : "I'll reorder and rewrite the slides to match when you approve."}</span>}
        {api.error && <p className="error" role="alert">{api.error}</p>}
      </div>
      <div className="stack" style={{ gap: 6 }}>
        <h2 className="eyebrow" style={{ fontSize: 13 }}>{deck ? "By the end, students can" : "By the end, viewers can"}</h2>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, lineHeight: 1.7 }}>
          {plan.learningObjectives.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </div>
    </div>
  );
}
