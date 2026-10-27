"use client";
import { useRef, useState } from "react";
import type { Slide } from "@ls/schema";
import type { Api } from "../plan/PlanEditor";
import type { VisualVersion } from "@/lib/types";

/** Versions of one slide's visual: make a new one, upload your own, or switch back. */
export function VisualPanel({ lessonId, slide, versions, api, deck, editable }: { lessonId: string; slide: Slide; versions: VisualVersion[]; api: Api; deck?: boolean; editable: boolean }) {
  const [note, setNote] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const base = `/api/lessons/${lessonId}/slides/${slide.slideId}`;
  const list = versions.length ? versions : [{ n: 1, chosen: true, upload: false }];

  async function makeNew() {
    if (await api.call("POST", `${base}/visual-version`, { note })) setNote("");
  }

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div role="group" aria-label="Versions of this visual" className="versions">
        {list.map((v) => (
          <button key={v.n} type="button" className="version" aria-pressed={v.chosen} disabled={!editable || api.pending}
            onClick={() => !v.chosen && api.call("PUT", `${base}/visual-version/${v.n}`)}>
            <span>Version {v.n}</span>
            {(v.note || v.upload) && <span className="muted" style={{ fontSize: 11 }}>{v.upload ? "Your upload" : v.note}</span>}
          </button>
        ))}
      </div>
      {editable && (
        <>
          <label htmlFor="vnote" style={{ fontSize: 13, color: "var(--muted)" }}>What should change? (optional)</label>
          <input id="vnote" className="field" placeholder={deck ? "e.g. “label the stroma and thylakoids”" : "e.g. “warmer colors, no needle”"} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="row">
            <button className="btn btn-ghost btn-sm" type="button" onClick={makeNew} disabled={api.pending}>Make a new version</button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => file.current?.click()} disabled={api.pending}>{deck ? "Use my own image or figure" : "Use my own image or clip"}</button>
            <input ref={file} type="file" accept="image/*,video/*" className="visually-hidden" aria-label="Choose your own image or clip" tabIndex={-1}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) api.call("POST", `${base}/visual-upload`, { fileName: f.name }); e.target.value = ""; }} />
          </div>
          <span className="muted" style={{ fontSize: 13 }}>Every version is kept, so you can switch back any time.</span>
        </>
      )}
    </div>
  );
}

export const chosenVersion = (versions: VisualVersion[]) => versions.find((v) => v.chosen)?.n ?? 1;
