import Link from "next/link";
import { AppFrame } from "@/components/AppFrame";
import { StartLesson } from "@/components/StartLesson";
import { coursesOf, session } from "@/lib/server";
import { lessonHref, statusLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, [string, string]> = {
  explainer_video: ["Video", "#0F766E"], lecture_deck: ["Deck", "#3442C9"], podcast_audio: ["Audio", "#0F766E"],
};
const STARTER_KIND: Record<string, string> = { str_recap: "Study sheet + video", str_training: "Visual aids" };
const STARTER_BLURB: Record<string, string> = {
  str_detailed: "A 2–3 minute narrated video that teaches one idea well and invites viewers into your course.",
  str_lecture: "Slides with speaker notes, citations and a few short clips to play in class.",
  str_social: "A dense idea, made simple, in a vertical video for a lay audience.",
  str_recap: "At-home study sheet and a 60-second recap of a lesson.",
  str_training: "Visual aids and scenario walk-throughs for live training sessions.",
  str_podcast: "Audio file to learn or review concepts on-the-go.",
};

export default async function HomePage() {
  const { repo, user } = await session();
  const courses = coursesOf(repo, user.id);
  const course = courses[0]!;
  const ids = new Set(courses.map((c) => c.id));
  const lessons = repo.list("lessons", (l) => ids.has(l.courseId)).sort((a, b) => Number(a.status === "ready") - Number(b.status === "ready"));
  const hero = lessons.find((l) => l.currentPlanId && l.status !== "ready");
  const starter = repo.get("starters", course.defaultStarterId)!;
  const audience = repo.get("audiences", course.defaultAudienceId)!;
  const template = repo.get("templates", course.defaultTemplateId)!;
  const heroStarter = hero ? repo.get("starters", hero.starterId) : undefined;

  return (
    <AppFrame user={user} courses={courses} current="home">
      <section className="stack" style={{ gap: 16 }}>
        <h1 style={{ fontSize: 34 }}>What are you teaching?</h1>
        <p className="muted" style={{ margin: 0, fontSize: 16 }}>Tell me the topic and who it&apos;s for. I&apos;ll set up the rest, and you can change anything.</p>
        <StartLesson initial={hero ? `${hero.title}, for my course audience` : ""} href={hero ? `/lessons/${hero.id}/sources` : `/courses/${course.id}`} />
        <div className="card" style={{ gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>Here&apos;s how I&apos;d set this up</div>
          <div className="grid-3">
            <div className="setup-cell"><span className="eyebrow">Making</span><span style={{ fontWeight: 600 }}>{starter.name}</span><Link href={`/courses/${course.id}`} style={{ fontSize: 13 }}>Change</Link></div>
            <div className="setup-cell"><span className="eyebrow">For</span><span style={{ fontWeight: 600 }}>{audience.name}</span><Link href={`/courses/${course.id}`} style={{ fontSize: 13 }}>Change</Link></div>
            <div className="setup-cell"><span className="eyebrow">Looks like</span>
              <span className="row" style={{ fontWeight: 600 }}><span aria-hidden="true" className="row" style={{ gap: 3 }}><Swatch c={template.colors.primary} /><Swatch c={template.colors.accent} /></span>{template.name}</span>
              <Link href="/templates" style={{ fontSize: 13 }}>Change</Link></div>
          </div>
        </div>
      </section>

      <section className="stack" style={{ gap: 14 }}>
        <h2>Or start from a Starter</h2>
        <div className="grid-3" style={{ gap: 14 }}>
          {repo.list("starters").map((s) => {
            const [kind, color] = KIND_LABEL[s.format]!;
            const inner = (<>
              <span className="eyebrow" style={{ color }}>{STARTER_KIND[s.id] ?? kind}</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</span>
              <span className="muted" style={{ fontSize: 14 }}>{STARTER_BLURB[s.id]}</span>
              {!s.buildable && <span className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Coming soon</span>}
            </>);
            const target = s.buildable ? (heroStarter?.id === s.id && hero ? `/lessons/${hero.id}/sources` : `/switch?to=${s.persona === "lecturer" ? "usr_ortiz" : "usr_maya"}`) : null;
            // Plain <a> for /switch: a prefetched Link would switch the demo user without a click.
            if (target?.startsWith("/switch")) return <a key={s.id} className="starter" href={target}>{inner}</a>;
            return target ? <Link key={s.id} className="starter" href={target}>{inner}</Link> : <div key={s.id} className="starter" aria-disabled="true">{inner}</div>;
          })}
        </div>
      </section>

      <section className="stack" style={{ gap: 14 }}>
        <h2>Recent lessons</h2>
        <div className="list">
          {lessons.map((l) => {
            const st = statusLabel(l);
            return (
              <Link key={l.id} className="list-row" href={lessonHref(l)}>
                <span style={{ fontWeight: 600 }}>{l.title}</span>
                <span className={`pill pill-${st.tone}`}>{st.text}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <form action="/reset" method="post"><button className="lnk" type="submit" style={{ color: "var(--muted)", fontWeight: 500 }}>Reset demo</button></form>
    </AppFrame>
  );
}

const Swatch = ({ c }: { c: string }) => <span style={{ width: 12, height: 12, borderRadius: 3, background: c, display: "inline-block" }} />;
