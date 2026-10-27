"use client";
import { useState } from "react";
import type { OutputFormat, TeachingPlan } from "@ls/schema";
import { useCall } from "@/lib/client";
import { StoryCard } from "./StoryCard";
import { VideoSlides } from "./VideoSlides";
import { DeckSections } from "./DeckSections";
import { PlanAssistant } from "./PlanAssistant";

export interface PlanView {
  lessonId: string;
  format: OutputFormat;
  plan: TeachingPlan;
  editable: boolean;
  summary: string;
  from: Record<string, string[]>;
  cite: Record<string, string>;
  drafts: { version: number; note?: string }[];
  tone?: string;
  courseTitle: string;
  courseId: string;
  alreadyKnown?: string;
  recapFrom?: string;
}

/** The Plan stage. Every change makes a new draft on the server; this component only holds what's being typed. */
export function PlanEditor({ view }: { view: PlanView }) {
  const deck = view.format === "lecture_deck";
  const { plan } = view;
  const api = useCall();
  const [ask, setAsk] = useState("");
  const [via, setVia] = useState<"typed" | "dictated">("typed");
  const [listening, setListening] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);

  async function stopListening() {
    setListening(false);
    const r = await api.call<{ text: string }>("POST", "/api/transcribe", { context: deck ? "lecture" : "plan" });
    if (r) { setAsk(r.text); setVia("dictated"); }
  }
  const dictation = { listening, start: () => setListening(true), stop: stopListening };

  return (
    <>
      <section aria-label={deck ? "Lecture outline" : "Teaching plan"} className="main-col">
        <div className="row-between" style={{ alignItems: "baseline" }}>
          <h1>{deck ? "Lecture outline" : "Teaching plan"}</h1>
          <span className="muted" style={{ fontSize: 14 }}>{view.summary}</span>
        </div>

        <div className="info-band">
          <span className="badge">Draft {plan.version}</span>
          <span style={{ flex: "1 1 360px" }}>
            {view.editable
              ? deck ? "This is a draft, not a decision. Edit any slide directly, talk me through your own outline, or tell me what to change on the right."
                : "This is a draft, not a decision. Edit any part directly, or tell me what to change on the right, by typing or talking."
              : "You approved this plan. You can still change the words and visuals in the preview."}
          </span>
          {view.drafts.length > 1 && (
            <button className="lnk" type="button" aria-expanded={showDrafts} onClick={() => setShowDrafts(!showDrafts)}>Earlier drafts</button>
          )}
        </div>
        {showDrafts && (
          <ol className="card" style={{ margin: 0, paddingLeft: 40, fontSize: 14, lineHeight: 1.6 }} aria-label="Drafts">
            {view.drafts.map((d) => (
              <li key={d.version}><strong>Draft {d.version}</strong>{d.version === plan.version ? " (this one)" : ""}{d.note ? `: from your note “${d.note}”` : d.version === 1 ? ": my first draft" : ": your direct edits"}</li>
            ))}
            <li style={{ listStyle: "none", marginLeft: -20 }} className="muted">Every draft is saved.</li>
          </ol>
        )}

        <StoryCard view={view} api={api} dictation={dictation} />
        {deck ? <DeckSections view={view} api={api} /> : <VideoSlides view={view} api={api} />}

        {plan.guidelineChecks.length > 0 && (
          <div className="card row" style={{ flexDirection: "row", padding: "14px 18px", fontSize: 14, gap: 10 }}>
            <span style={{ fontWeight: 600 }}>Follows your guidelines:</span>
            {plan.guidelineChecks.map((g, i) => (
              <span key={g.guidelineId} className="row" style={{ gap: 10 }}>
                {i > 0 && <span aria-hidden="true" style={{ color: "#C4C9D4" }}>·</span>}
                <span style={{ color: g.passed ? "var(--success-text)" : "var(--warning-text)" }}>{g.note}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      <PlanAssistant view={view} api={api} ask={ask} setAsk={(t) => { setAsk(t); setVia("typed"); }} via={via} dictation={dictation} />
    </>
  );
}

export type Api = ReturnType<typeof useCall>;
export type Dictation = { listening: boolean; start: () => void; stop: () => void };
