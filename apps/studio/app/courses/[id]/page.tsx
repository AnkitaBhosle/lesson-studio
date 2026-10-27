import Link from "next/link";
import { notFound } from "next/navigation";
import { resolvePreferences } from "@ls/orchestrator";
import { AppFrame } from "@/components/AppFrame";
import { AddGuideline } from "@/components/AddGuideline";
import { coursesOf, session } from "@/lib/server";
import { formatLabel, lessonHref, statusLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { repo, user, mode } = await session();
  const course = repo.get("courses", id);
  if (!course || course.ownerId !== user.id) notFound();
  const lessons = repo.list("lessons", (l) => l.courseId === id);
  const starter = repo.get("starters", course.defaultStarterId)!;
  const audience = repo.get("audiences", course.defaultAudienceId)!;
  const template = repo.get("templates", course.defaultTemplateId)!;
  const guidelines = repo.list("guidelines", (g) => g.scope === "course" && g.scopeId === id);
  const prefs = resolvePreferences(repo, user.id, id);
  const generalById = new Map((prefs.general?.items ?? []).map((i) => [i.itemId, i]));
  const tasks = repo.list("scheduledTasks", (t) => t.courseId === id);
  const draftTask = tasks.find((t) => t.enabled && t.action === "draft_next_lesson");
  const inProgress = lessons.find((l) => l.currentPlanId && l.status !== "ready");

  const sub = (l: (typeof lessons)[number]) => {
    if (l.status === "draft") return draftTask ? `Draft will be ready ${draftTask.cadence.split(" ")[1] ?? "soon"}` : "Not started";
    const plan = l.currentPlanId ? repo.get("plans", l.currentPlanId) : undefined;
    return plan ? `${formatLabel(l)} · ${plan.slides.length} slides` : formatLabel(l);
  };

  return (
    <AppFrame mode={mode} user={user} courses={coursesOf(repo, user.id)} current="courses" courseId={id}>
      <div className="row-between" style={{ alignItems: "flex-end" }}>
        <div className="stack" style={{ gap: 4 }}>
          <span className="eyebrow">Course · {course.description.split(",")[0]}</span>
          <h1>{course.title}</h1>
        </div>
        {inProgress && <Link className="btn btn-primary" href={`/lessons/${inProgress.id}/sources`}>New lesson</Link>}
      </div>
      <div className="row" style={{ alignItems: "flex-start", gap: 24 }}>
        <section aria-label="Lessons" className="stack" style={{ flex: "999 1 480px", gap: 14 }}>
          <h2>Lessons</h2>
          <div className="list">
            {lessons.map((l) => {
              const st = statusLabel(l);
              return (
                <Link key={l.id} className="list-row" href={l.status === "draft" ? `/courses/${id}` : lessonHref(l)}>
                  <span className="stack" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>{l.title}</span><span className="muted" style={{ fontSize: 13 }}>{sub(l)}</span></span>
                  <span className={`pill pill-${st.tone}`}>{st.text}</span>
                </Link>
              );
            })}
          </div>
        </section>
        <aside aria-label="Course settings" className="card" style={{ flex: "1 1 300px", maxWidth: 380, gap: 16 }}>
          <h2 style={{ fontSize: 17 }}>Course settings</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>Every new lesson in {course.title.split(" · ")[0]} starts with these. Change them here or per lesson.</p>
          <Setting label="Making"><span style={{ fontWeight: 600 }}>{starter.name}</span></Setting>
          <Setting label="For"><span style={{ fontWeight: 600 }}>{audience.name}</span></Setting>
          <Setting label="Looks like"><Link href="/templates" className="row" style={{ fontWeight: 600 }}>
            <span aria-hidden="true" className="row" style={{ gap: 3 }}>{[template.colors.primary, template.colors.accent].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />)}</span>{template.name}</Link></Setting>
          <Setting label="Guidelines">
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6 }}>{guidelines.map((g) => <li key={g.id}>{g.text}</li>)}</ul>
            <AddGuideline courseId={id} />
          </Setting>
          <Setting label="Preferences for this course">
            {(prefs.course?.items ?? []).map((i) => {
              const over = i.overridesItemId ? generalById.get(i.overridesItemId) : undefined;
              return (
                <span key={i.itemId} className="stack" style={{ gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{i.value}</span>
                  <span className="muted" style={{ fontSize: 13 }}>{over ? `Overrides your general preference: ${over.value.toLowerCase()}` : i.origin === "teacher" ? "Set by you" : i.evidence}</span>
                </span>
              );
            })}
            <Link href={`/settings?course=${id}`} style={{ fontSize: 14 }}>Edit course preferences</Link>
          </Setting>
          <Setting label="Scheduled">
            {tasks.map((t) => <span key={t.id} style={{ fontSize: 14 }}>{t.name} {t.cadence.charAt(0).toLowerCase() + t.cadence.slice(1)}{t.enabled ? "" : " (off)"}</span>)}
            <Link href="/settings" style={{ fontSize: 14 }}>Manage</Link>
          </Setting>
        </aside>
      </div>
    </AppFrame>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="stack" style={{ gap: 6, paddingTop: 12, borderTop: "1px solid #EEF0F4" }}><span className="eyebrow">{label}</span>{children}</div>;
}
