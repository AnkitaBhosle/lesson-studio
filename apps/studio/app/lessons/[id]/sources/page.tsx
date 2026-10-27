import Link from "next/link";
import { LessonFrame } from "@/components/LessonFrame";
import { SourceCard, SuggestedSource } from "@/components/SourceCards";
import { AddSources, PlanButton } from "@/components/AddSources";
import { Arrow, Check, Drive, LinkIcon, Mic, Paste, Upload } from "@/components/icons";
import { loadLesson } from "@/lib/lesson";
import { needsCheck, wasChecked } from "@/lib/labels";

export const dynamic = "force-dynamic";

const VERB: Record<string, string> = { voice_memo: "Listened to", url: "Read", pdf: "Read", text: "Read" };

export default async function SourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadLesson(id);
  const deck = d.lesson.format === "lecture_deck";
  const usable = d.sources.filter((s) => s.approvedForUse);
  const suggested = d.sources.find((s) => !s.approvedForUse);
  const facts = usable.reduce((n, s) => n + (s.digest?.quotableFacts.length ?? 0), 0);
  const figures = usable.reduce((n, s) => n + (s.digest?.figures.length ?? 0), 0);
  const gap = d.plan?.slides.find((s) => needsCheck(s) || wasChecked(s));
  const concepts = [...new Set(usable.flatMap((s) => s.digest?.keyConcepts.map((k) => k.name) ?? []))].slice(0, 6);
  const learn = d.plan?.slides.filter((s) => s.role === "context" || s.role === "concept") ?? [];

  return (
    <LessonFrame mode={d.mode} user={d.user} course={d.course} lesson={d.lesson} stage="sources">
      <section aria-label="Add sources" className="side-col">
        <h2>Add what you have</h2>
        {d.mode === "live" ? <AddSources lessonId={id} /> : (<>
        {(deck
          ? [[<Upload key="u" />, "Upload a file"], [<LinkIcon key="l" />, "Add a link"], [<Paste key="p" />, "Last term's slides"], [<Drive key="d" />, "From Canvas"]]
          : [[<Paste key="p" />, "Paste text"], [<Upload key="u" />, "Upload a file"], [<LinkIcon key="l" />, "Add a link"], [<Mic key="m" size={18} />, "Record a voice memo"], [<Drive key="d" />, "From Google Drive"]]
        ).map(([icon, label]) => (
          <button key={label as string} className="addsrc" type="button" disabled title="Adding new sources arrives in a later version of the demo">{icon}{label}</button>
        ))}
        <p className="muted" style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5 }}>{deck ? "Notes, readings, old slides, recorded lectures." : "Notes, readings, slides, videos, voice memos. Messy is fine."}</p>
        </>)}
      </section>

      <section aria-label="Your sources" className="main-col" style={{ flex: "999 1 460px", padding: "24px 20px" }}>
        <div className="row-between" style={{ alignItems: "baseline" }}>
          <h1>Your sources</h1>
          <span className="muted" style={{ fontSize: 14 }}>{usable.length} sources · {facts} facts{figures ? ` · ${figures} figures` : ""} I can use</span>
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--text-2)" }}>
          Everything here shapes the lesson. You decide which sources {deck ? "students" : "viewers"} see cited. Notes and voice memos stay private unless you say otherwise.
        </p>
        {usable.length === 0 && <div className="card"><p className="muted" style={{ margin: 0 }}>Nothing yet. Paste your notes or an outline on the left: that&apos;s all I need to start.</p></div>}
        {usable.map((s) => <SourceCard key={s.id} source={s} audience={deck ? "students" : "viewers"} lessonId={d.mode === "live" && !d.plan ? id : undefined} />)}
      </section>

      <aside aria-label="Assistant" className="assistant" style={{ maxWidth: 380 }}>
        <h2>Assistant</h2>
        <ul className="checklist">
          {usable.map((s) => (
            <li key={s.id}><Check />{VERB[s.kind] ?? "Read"} {s.kind === "voice_memo" ? "your voice memo" : s.kind === "text" ? "your notes" : s.title}. Found {s.digest?.quotableFacts.length ?? 0} facts{s.digest?.figures.length ? ` and ${s.digest.figures.length} figures` : ""}.</li>
          ))}
        </ul>

        {deck ? (
          <div className="stack" style={{ gap: 8 }}>
            <h3>Key ideas I found</h3>
            <div className="row" style={{ gap: 6 }}>{concepts.map((c) => <span key={c} className="src-chip">{c}</span>)}</div>
          </div>
        ) : learn.length > 0 && (
          <div className="stack" style={{ gap: 8 }}>
            <h3>What viewers will learn</h3>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
              {learn.map((s) => (
                <li key={s.slideId} className="row-between">
                  <span>{s.title}</span>
                  {needsCheck(s) ? <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>Missing</span> : <span className="ok-text">Covered</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggested && <SuggestedSource lessonId={id} source={suggested} />}
        {!deck && gap && needsCheck(gap) && (
          <div className="warn-box">
            <p style={{ margin: 0 }}><strong>One gap.</strong> Your sources don&apos;t cover “{gap.title.toLowerCase()}”, and beginners usually ask about it.</p>
            <div className="stack" style={{ gap: 8 }}>
              <button className="btn btn-ghost btn-sm" type="button" disabled title="Adding new sources arrives in a later version of the demo">Add a source for it</button>
              <Link className="btn btn-ghost btn-sm" href={`/lessons/${id}/plan#${gap.slideId}`}>Draft it from general knowledge</Link>
            </div>
            <p style={{ margin: 0, fontSize: 13 }}>If I draft it, I&apos;ll mark it so you can check it before anything is made.</p>
          </div>
        )}

        {d.plan ? <Link className="btn btn-primary" href={`/lessons/${id}/plan`}>{deck ? "Plan the lecture" : "Plan the lesson"} <Arrow /></Link>
          : <PlanButton lessonId={id} label={deck ? "Plan the lecture" : "Plan the lesson"} ready={facts > 0} />}
      </aside>
    </LessonFrame>
  );
}
