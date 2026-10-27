"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Slide, Template } from "@ls/schema";
import { useCall } from "@/lib/client";
import { clock, duration } from "@/lib/labels";
import { Pause, Play } from "../icons";
import { VideoFrame } from "../SlideArt";
import { chosenVersion, VisualPanel } from "./VisualPanel";
import type { VisualVersion } from "@/lib/types";

const caption = (s: Slide) => s.narrative?.split(/(?<=[.?!])\s+/).slice(-1)[0];

export function VideoPreview({ lessonId, slides, template, versions, takes, editable }: { lessonId: string; slides: Slide[]; template: Template; versions: Record<string, VisualVersion[]>; takes: Record<string, number>; editable: boolean }) {
  const router = useRouter();
  const api = useCall();
  const starts = slides.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1]! + (slides[i - 1]!.estDurationSec ?? 0)], []);
  const total = starts[starts.length - 1]! + (slides[slides.length - 1]?.estDurationSec ?? 0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [sel, setSel] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const slide = slides[sel]!;
  const [line, setLine] = useState(slide.narrative ?? "");
  const [recorded, setRecorded] = useState<Record<string, boolean>>({});

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  useEffect(() => { setLine(slides[sel]?.narrative ?? ""); }, [sel, slides]);

  const current = starts.reduce((acc, s, i) => (t >= s ? i : acc), 0);
  const frameSlide = slides[current]!;

  function toggle() {
    if (playing) { if (timer.current) clearInterval(timer.current); setPlaying(false); return; }
    timer.current = setInterval(() => setT((x) => {
      if (x + 1 >= total) { if (timer.current) clearInterval(timer.current); setPlaying(false); return 0; }
      return x + 1;
    }), 120);
    setPlaying(true);
  }
  function pick(i: number) { setSel(i); setT(starts[i]!); }
  async function rerecord() {
    if (await api.call("POST", `/api/lessons/${lessonId}/slides/${slide.slideId}/rerecord`, { narrative: line })) setRecorded({ ...recorded, [slide.slideId]: true });
  }
  async function finish() {
    if (await api.call("POST", `/api/lessons/${lessonId}/preview/approve`)) router.push(`/lessons/${lessonId}/final`);
  }
  const edited = line.trim() !== (slide.narrative ?? "").trim();

  return (
    <>
      <section aria-label="Video preview" className="main-col">
        <div className="row-between" style={{ alignItems: "baseline" }}>
          <h1>Preview</h1>
          <span className="muted" style={{ fontSize: 14 }}>{duration(total).replace("about ", "")} · {slides.length} slides</span>
        </div>
        <div className="player">
          <VideoFrame slide={frameSlide} template={template} version={chosenVersion(versions[frameSlide.slideId] ?? [])} caption={caption(frameSlide)} />
          <div className="controls">
            <button type="button" className="playbtn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause /> : <Play />}</button>
            <div className="progress" aria-hidden="true"><span style={{ width: `${Math.round((t / total) * 100)}%` }} /></div>
            <span className="muted" style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{clock(t)} / {clock(total)}</span>
          </div>
        </div>
        <div className="thumbs">
          {slides.map((s, i) => (
            <button key={s.slideId} type="button" className="thumb" aria-current={i === sel} aria-label={`Slide ${s.order}: ${s.title}`} onClick={() => pick(i)}>
              <span style={{ borderRadius: 8, overflow: "hidden" }}><VideoFrame slide={s} template={template} version={chosenVersion(versions[s.slideId] ?? [])} compact /></span>
              <span>{s.order}. {s.title}</span>
            </button>
          ))}
        </div>
      </section>

      <aside aria-label="Assistant" className="assistant">
        <h2>Assistant</h2>
        <div className="note-box">{editable ? "This is a draft. Every slide is still editable: pick a slide below the player, then change its words or its visual here. Nothing is final until you finish the video." : "This video is finished. Its draft is kept here for reference."}</div>
        <h3 style={{ fontSize: 16 }}>Slide {slide.order}: {slide.title}</h3>
        <div className="stack" style={{ gap: 8 }}>
          <label htmlFor="line" className="eyebrow">Narrative</label>
          <textarea id="line" className="field" rows={4} value={line} onChange={(e) => setLine(e.target.value)} readOnly={!editable} />
          {editable && <>
            <span className="muted" style={{ fontSize: 13 }}>Change the words and I&apos;ll re-record the narration for this slide only, in the same voice.</span>
            <div className="row">
              <button className="btn btn-ghost btn-sm" type="button" onClick={rerecord} disabled={!edited || api.pending}>Re-record this slide</button>
              <span className="muted" style={{ fontSize: 13 }} role="status">{recorded[slide.slideId] ? `Re-recorded (take ${takes[slide.slideId] ?? 1}). Play the slide to hear it.` : edited ? "" : "Edit the words to re-record."}</span>
            </div>
          </>}
        </div>
        <div className="stack" style={{ gap: 8 }}>
          <span className="eyebrow">Visual</span>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }}>{slide.visual}</p>
          <VisualPanel lessonId={lessonId} slide={slide} versions={versions[slide.slideId] ?? []} api={api} editable={editable} />
        </div>
        <div className="note-box">Captions are on, and every fact on screen still points to your sources.</div>
        {api.error && <p className="error" role="alert">{api.error}</p>}
        {editable ? <button className="btn btn-primary" type="button" onClick={finish} disabled={api.pending}>Looks good, finish the video</button>
          : <a className="btn btn-primary" href={`/lessons/${lessonId}/final`}>See the finished video</a>}
      </aside>
    </>
  );
}
