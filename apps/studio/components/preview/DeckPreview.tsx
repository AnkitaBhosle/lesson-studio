"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Slide, Template } from "@ls/schema";
import { useCall } from "@/lib/client";
import type { VisualVersion } from "@/lib/types";
import { Check } from "../icons";
import { DeckSlide } from "../SlideArt";
import { chosenVersion, VisualPanel } from "./VisualPanel";

export function DeckPreview({ lessonId, slides, template, versions, cite, courseLabel, editable }: { lessonId: string; slides: Slide[]; template: Template; versions: Record<string, VisualVersion[]>; cite: Record<string, string>; courseLabel: string; editable: boolean }) {
  const router = useRouter();
  const api = useCall();
  const [sel, setSel] = useState(0);
  const slide = slides[sel]!;
  const [notes, setNotes] = useState(slide.speakerNotes ?? "");
  const [bullets, setBullets] = useState(slide.bullets.join("\n"));
  const [editingText, setEditingText] = useState(false);
  useEffect(() => { setNotes(slides[sel]?.speakerNotes ?? ""); setBullets(slides[sel]?.bullets.join("\n") ?? ""); setEditingText(false); }, [sel, slides]);

  const url = `/api/lessons/${lessonId}/slides/${slide.slideId}`;
  const saveNotes = () => { if (notes !== (slide.speakerNotes ?? "")) api.call("PATCH", url, { speakerNotes: notes }); };
  async function saveText() {
    if (bullets !== slide.bullets.join("\n")) await api.call("PATCH", url, { bullets: bullets.split("\n") });
    setEditingText(false);
  }
  async function finish() {
    if (await api.call("POST", `/api/lessons/${lessonId}/preview/approve`)) router.push(`/lessons/${lessonId}/final`);
  }
  const visuals = slides.filter((s) => s.visualType !== "title_card").length;
  const checked = slides.filter((s) => s.claims.some((c) => c.status === "general_knowledge_checked"));

  return (
    <>
      <section aria-label="Slides" className="strip">
        <h2 style={{ margin: "0 0 4px", fontSize: 15 }}>{slides.length} slides</h2>
        {slides.map((s, i) => (
          <button key={s.slideId} type="button" className="strip-item" aria-current={i === sel} onClick={() => setSel(i)}>
            <span className="muted" style={{ width: 20, fontWeight: 700 }}>{s.order}</span>
            <span style={{ width: 64, flex: "none" }}><DeckSlide slide={s} template={template} courseLabel={courseLabel} version={chosenVersion(versions[s.slideId] ?? [])} compact /></span>
            <span style={{ fontSize: 12, lineHeight: 1.3 }}>{s.title}</span>
          </button>
        ))}
      </section>

      <section aria-label="Slide preview" className="main-col" style={{ flex: "999 1 480px" }}>
        <DeckSlide slide={slide} template={template} courseLabel={courseLabel} version={chosenVersion(versions[slide.slideId] ?? [])} cite={cite[slide.slideId]} />
        {editable && (editingText ? (
          <div className="stack" style={{ gap: 6 }}>
            <label htmlFor="bullets" style={{ fontSize: 13, fontWeight: 600 }}>Text on slide {slide.order} (one point per line)</label>
            <textarea id="bullets" className="field" rows={3} value={bullets} onChange={(e) => setBullets(e.target.value)} />
            <button className="btn btn-ghost btn-sm" type="button" style={{ alignSelf: "flex-start" }} onClick={saveText} disabled={api.pending}>Done</button>
          </div>
        ) : <button className="act" type="button" style={{ alignSelf: "flex-start" }} onClick={() => setEditingText(true)}>Edit the text on this slide</button>)}
        <div className="stack" style={{ gap: 6 }}>
          <label htmlFor="notes" style={{ fontSize: 13, fontWeight: 600 }}>Speaker notes · slide {slide.order}</label>
          <textarea id="notes" className="field" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveNotes} readOnly={!editable} />
        </div>
      </section>

      <aside aria-label="Assistant" className="assistant" style={{ maxWidth: 360 }}>
        <h2>Assistant</h2>
        <div className="note-box">{editable ? "This is a draft. Edit the text on any slide or its speaker notes, or change a slide's visual here. Nothing is final until you finish the deck." : "This deck is finished. Its draft is kept here for reference."}</div>
        <div className="stack" style={{ gap: 8 }}>
          <h3>Visual · slide {slide.order}</h3>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }}>{slide.visual}</p>
          <VisualPanel lessonId={lessonId} slide={slide} versions={versions[slide.slideId] ?? []} api={api} deck editable={editable} />
        </div>
        <ul className="checklist">
          <li><Check />Every factual slide cites a source</li>
          <li><Check />All {visuals} visuals have alt text</li>
          {checked.map((s) => <li key={s.slideId}><Check />Slide {s.order} ({s.title.toLowerCase()}) is from general knowledge and was checked by you</li>)}
        </ul>
        {api.error && <p className="error" role="alert">{api.error}</p>}
        {editable ? <button className="btn btn-primary" type="button" onClick={finish} disabled={api.pending}>Looks good, finish the deck</button>
          : <a className="btn btn-primary" href={`/lessons/${lessonId}/final`}>See the finished deck</a>}
      </aside>
    </>
  );
}
