"use client";
import { useState } from "react";
import type { OutputFormat, Template } from "@ls/schema";

interface Item { id: string; name: string; colors: Template["colors"]; heading: string; formats: OutputFormat[]; blurb: string; sample: string; fromBrand: boolean; usedFor: string[] }

const TABS = [["All", null], ["Videos", "explainer_video"], ["Decks", "lecture_deck"]] as const;

export function TemplateGrid({ templates }: { templates: Item[] }) {
  const [tab, setTab] = useState(0);
  const want = TABS[tab]![1];
  const shown = templates.filter((t) => !want || t.formats.includes(want));
  return (
    <>
      <div role="group" aria-label="Filter templates" className="row">
        {TABS.map(([label], i) => <button key={label} type="button" className="chip" aria-pressed={tab === i} onClick={() => setTab(i)}>{label}</button>)}
      </div>
      <div className="grid-3" style={{ gap: 16 }}>
        {shown.map((t) => (
          <article key={t.id} className="card" style={{ padding: 0, overflow: "hidden", gap: 0 }}>
            <div aria-hidden="true" style={{ aspectRatio: "16 / 9", background: t.colors.background, color: t.colors.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, borderBottom: `6px solid ${t.colors.accent}` }}>
              <span style={{ fontFamily: `${t.heading}, Georgia, serif`, fontWeight: 700, fontSize: 20, textAlign: "center", color: t.colors.primary === t.colors.background ? t.colors.text : t.colors.primary }}>{t.sample}</span>
            </div>
            <div className="stack" style={{ padding: "14px 16px", gap: 6 }}>
              <div className="row-between"><h2 style={{ fontSize: 16 }}>{t.name}</h2>{t.fromBrand && <span className="tag tag-ok">Made from your brand</span>}</div>
              <span className="muted" style={{ fontSize: 14, lineHeight: 1.5 }}>{t.blurb}</span>
              {t.usedFor.length > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-hover)" }}>Used for {t.usedFor.join(", ")}</span>}
            </div>
          </article>
        ))}
        <article className="card" style={{ borderStyle: "dashed", justifyContent: "center" }}>
          <h2 style={{ fontSize: 16 }}>Make from my brand</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>Upload your logo or a few past slides or videos. I&apos;ll pick up your colors and type and build a template that looks like you.</p>
          <button className="btn btn-ghost" type="button" disabled title="Arrives in a later version of the demo">Upload logo or examples</button>
        </article>
      </div>
    </>
  );
}
