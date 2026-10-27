"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mic } from "../icons";
import type { Api, Dictation, PlanView } from "./PlanEditor";

interface Question { label: string; options: string[]; initial: number }

function questionsFor(view: PlanView): Question[] {
  if (view.format === "lecture_deck") {
    return [
      { label: "How long is the lecture?", options: ["50 minutes", "75 minutes"], initial: 0 },
      { label: "Where do students usually get stuck?", options: ["Light vs. Calvin cycle", "Where the oxygen comes from", "Following the carbon"], initial: 1 },
    ];
  }
  const tones = ["Warm and encouraging", "Straight to the point", "Playful"];
  const t = tones.findIndex((x) => x.toLowerCase() === view.tone?.toLowerCase());
  return [
    { label: "Who's watching?", options: ["Total beginners", "Know some basics", "Already investing"], initial: 0 },
    { label: "How long?", options: ["About 90 seconds", "2–3 minutes", "About 5 minutes"], initial: 1 },
    { label: "What tone?", options: tones, initial: t >= 0 ? t : 0 },
  ];
}

const SUGGESTIONS = {
  explainer_video: ["Make it shorter", "Add an example about fees", "Punchier hook"],
  lecture_deck: ["Shorter Calvin cycle section", "More questions for the class", "Add a hands-on demo"],
  podcast_audio: ["Make it shorter"],
};

export function PlanAssistant({ view, api, ask, setAsk, via, dictation }: { view: PlanView; api: Api; ask: string; setAsk: (t: string) => void; via: "typed" | "dictated"; dictation: Dictation }) {
  const router = useRouter();
  const deck = view.format === "lecture_deck";
  const { plan, lessonId, editable } = view;
  const questions = questionsFor(view);
  const [answers, setAnswers] = useState(questions.map((q) => q.initial));
  const [revised, setRevised] = useState<string | null>(null);
  const base = `/api/lessons/${lessonId}`;

  async function revise() {
    const r = await api.call<{ summary: string }>("POST", `${base}/plan/revise`, { text: ask, via });
    if (r) { setRevised(r.summary); setAsk(""); }
  }
  async function approve() {
    if (await api.call("POST", `${base}/plan/approve`)) router.push(`/lessons/${lessonId}/preview`);
  }

  if (!editable) {
    return (
      <aside aria-label="Assistant" className="assistant">
        <h2>Assistant</h2>
        <p className="note-box" style={{ margin: 0 }}>This plan is approved. Make changes slide by slide in the preview.</p>
        <Link className="btn btn-primary" href={`/lessons/${lessonId}/preview`}>Go to the preview</Link>
      </aside>
    );
  }

  return (
    <aside aria-label="Assistant" className="assistant" style={{ gap: 20 }}>
      <h2>Assistant</h2>
      <div className="ask-box">
        <label htmlFor="change" style={{ fontSize: 14, fontWeight: 700 }}>Tell me what to change</label>
        <textarea id="change" className="field" rows={3} value={ask} onChange={(e) => setAsk(e.target.value)}
          placeholder={deck ? "e.g. “Spend less time on the Calvin cycle and add a demo with a leaf in water”" : "e.g. “Make the hook punchier and add an example about fees”"} />
        <div className="row" style={{ gap: 6 }}>
          {SUGGESTIONS[view.format].map((s) => <button key={s} className="chip chip-sm" type="button" onClick={() => setAsk(ask ? `${ask}. ${s}` : s)}>{s}</button>)}
        </div>
        {dictation.listening && (
          <div className="listening" role="status"><span aria-hidden="true" className="dot" />Listening…<button className="act" type="button" onClick={dictation.stop}>Stop</button></div>
        )}
        <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
          <button className="btn btn-ghost" type="button" aria-label="Dictate your changes" aria-pressed={dictation.listening} onClick={dictation.listening ? dictation.stop : dictation.start} style={{ padding: "0 14px" }}><Mic size={18} /></button>
          <button className="btn btn-primary" type="button" style={{ flex: 1 }} onClick={revise} disabled={api.pending || !ask.trim()}>{deck ? "Revise the outline" : "Revise the plan"}</button>
        </div>
        {revised && <p className="ok-text" role="status" style={{ margin: 0, fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{revised}</p>}
      </div>

      {view.alreadyKnown && (
        <div className="stack" style={{ gap: 10 }}>
          <h3>{deck ? "What students already know" : "What viewers already know"}</h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }}>{view.alreadyKnown}</p>
          {plan.recap?.decision === "pending" && (
            <div className="warn-box">
              <p style={{ margin: 0 }}><strong>Suggestion:</strong> {plan.recap.summary}</p>
              <div className="row">
                <button className="btn btn-ghost btn-sm" type="button" disabled={api.pending} onClick={() => api.call("POST", `${base}/recap`, { decision: "added" })}>Add the recap</button>
                <button className="btn btn-ghost btn-sm" type="button" disabled={api.pending} onClick={() => api.call("POST", `${base}/recap`, { decision: "skipped" })}>Not this time</button>
              </div>
            </div>
          )}
          {plan.recap?.decision === "added" && <span className="ok-text" style={{ fontSize: 14 }}>Added a {plan.recap.slides.length}-slide recap at the start.</span>}
          {plan.recap?.decision === "skipped" && <span className="muted" style={{ fontSize: 14 }}>No recap this time.</span>}
          <Link href={`/courses/${view.courseId}`} style={{ fontSize: 14 }}>Something&apos;s off? Edit what {deck ? "students" : "viewers"} know</Link>
        </div>
      )}

      {!deck && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }}>A few quick questions. I&apos;ve picked what I&apos;d guess; change any that are wrong.</p>}
      {questions.map((q, qi) => (
        <fieldset key={q.label} style={{ border: 0, margin: 0, padding: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 8 }}>{q.label}</legend>
          <div className="row">
            {q.options.map((o, oi) => (
              <button key={o} className="chip" type="button" aria-pressed={answers[qi] === oi} onClick={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))}>{o}</button>
            ))}
          </div>
        </fieldset>
      ))}

      {plan.assumptions.map((a) => (
        <div key={a} className="note-box"><strong style={{ color: "var(--text)" }}>I assumed</strong> {a.charAt(0).toLowerCase() + a.slice(1)}. <button className="lnk" type="button" style={{ minHeight: 0 }} onClick={() => setAsk(`Change this: ${a.toLowerCase()}`)}>Change</button></div>
      ))}

      <div className="stack">
        <button className="btn btn-primary" type="button" onClick={approve} disabled={api.pending}>{deck ? "Approve outline and build the deck" : "Approve plan and make a preview"}</button>
        {api.error && <p className="error" role="alert">{api.error}</p>}
        <p className="muted" style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>Nothing is made until you approve. {deck ? "You can edit every slide in the preview." : "You can still change anything in the preview."}</p>
      </div>
    </aside>
  );
}
