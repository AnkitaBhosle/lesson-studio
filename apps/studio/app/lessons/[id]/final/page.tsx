import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LessonFrame } from "@/components/LessonFrame";
import { DeckSlide, VideoFrame } from "@/components/SlideArt";
import { DemoButton, SourcesCardPanel } from "@/components/FinalControls";
import { Check, Done } from "@/components/icons";
import { loadLesson } from "@/lib/lesson";
import { clock, duration, sourceKind } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function FinalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadLesson(id);
  if (d.lesson.status !== "ready") redirect(`/lessons/${id}/${d.plan ? "plan" : "sources"}`);
  if (!d.template) notFound();
  const deck = d.lesson.format === "lecture_deck";
  const slides = d.plan?.slides ?? [];
  const course = d.course.title.split(" · ")[0]!;
  const checked = slides.filter((s) => s.claims.some((c) => c.status === "general_knowledge_checked"));
  const used = d.sources.filter((s) => s.approvedForUse);
  const citing = (sid: string) => slides.filter((s) => s.claims.some((c) => c.citations.some((x) => x.sourceId === sid))).length;
  const total = slides.reduce((n, s) => n + (s.estDurationSec ?? 0), 0);

  return (
    <LessonFrame user={d.user} course={d.course} lesson={d.lesson} stage="final">
      <main className="page" style={{ padding: "32px 28px 64px" }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 24, maxWidth: 1180, margin: "0 auto" }}>
          <section aria-label={deck ? "Your deck" : "Your video"} className="stack" style={{ flex: "999 1 520px", gap: 18 }}>
            <div className="row" style={{ gap: 10 }}><Done /><h1>{deck ? "Your lecture deck is ready" : "Your video is ready"}</h1></div>
            {!slides.length ? null : deck ? (
              <>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {slides.length} slides · {duration(d.lesson.targetDurationSec)} · {slides.filter((s) => s.visualType === "generated_clip").length} clips to play in class · added to {course}, {d.lesson.title.split(" · ")[0]}
                </p>
                <div className="grid-3">
                  {[slides[0], slides.find((s) => /parts of/i.test(s.title)) ?? slides[6], slides.find((s) => /following/i.test(s.title)) ?? slides[18]].filter(Boolean).map((s) => (
                    <DeckSlide key={s!.slideId} slide={s!} template={d.template!} courseLabel={course} compact />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)" }}>
                <VideoFrame slide={slides[0]!} template={d.template} caption={undefined} />
                <span className="pill" style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(0,0,0,0.65)", color: "#fff" }}>{clock(total)}</span>
              </div>
            )}
            <div className="row">
              {deck ? <>
                <DemoButton primary>Present</DemoButton><DemoButton>Download</DemoButton><DemoButton>Speaker notes view</DemoButton>
                {slides.length > 0 && <Link className="btn btn-ghost" href={`/lessons/${id}/preview`}>Edit slides</Link>}
              </> : <>
                <DemoButton primary>Download video</DemoButton><DemoButton>Add to {course}</DemoButton><DemoButton>Post to YouTube</DemoButton>
              </>}
            </div>

            {deck ? (
              <div className="card">
                <h2 style={{ fontSize: 17 }}>Before you present</h2>
                <ul className="checklist">
                  <li><Check />Every factual slide cites a source</li>
                  <li><Check />All {slides.filter((s) => s.visualType !== "title_card").length} visuals have alt text</li>
                  {checked.length > 0 && <li><Check />The general-knowledge {checked.length === 1 ? "slide was" : "slides were"} checked by you</li>}
                </ul>
              </div>
            ) : (
              <SourcesCardPanel lessonId={id} show={d.lesson.sourcesCard.show}
                sources={used.map((s) => ({ id: s.id, name: s.title, kind: sourceKind(s), cited: s.visibility === "cited", privateNote: s.kind === "text" || s.kind === "voice_memo" }))}
                checked={checked.map((s) => s.title)} />
            )}
          </section>

          <aside aria-label="Files and next steps" className="stack" style={{ flex: "1 1 300px", maxWidth: 380, gap: 16 }}>
            {deck ? (
              <div className="card">
                <h2 style={{ fontSize: 17 }}>Sources cited</h2>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
                  {used.filter((s) => s.visibility === "cited" || citing(s.id) > 0).map((s) => <li key={s.id}>{s.title}{citing(s.id) ? ` (${citing(s.id)} ${citing(s.id) === 1 ? "slide" : "slides"})` : ""}</li>)}
                </ul>
              </div>
            ) : (
              <div className="card" style={{ gap: 4 }}>
                <h2 style={{ fontSize: 17, marginBottom: 8 }}>Lesson components</h2>
                {["Video", "Captions", "Thumbnail"].map((f) => <div key={f} className="file-row"><span>{f}</span><DemoButton link>Download</DemoButton></div>)}
                {slides.length > 0 && <Link className="file-row" href={`/lessons/${id}/plan`}><span>Script and plan</span><span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>Open</span></Link>}
              </div>
            )}
            <div className="card">
              <h2 style={{ fontSize: 17 }}>{deck ? "Make more from this lecture" : "Make more from this lesson"}</h2>
              {(deck
                ? [["A one-page study sheet for students", "Key terms, the two stages, and three practice questions."], ["A 60-second recap video", "To post in Canvas after class."]]
                : [["A 45-second cut for Instagram", "Same sources and voice, vertical, one idea."], ["A one-page study sheet", `For students in your course to keep.`]]
              ).map(([t, s]) => (
                <div key={t} className="next" aria-disabled="true"><span style={{ fontWeight: 600 }}>{t}</span><span className="muted" style={{ fontSize: 14 }}>{s}</span><span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Coming soon</span></div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </LessonFrame>
  );
}
