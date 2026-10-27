import { notFound } from "next/navigation";
import { LessonFrame } from "@/components/LessonFrame";
import { PlanEditor, type PlanView } from "@/components/plan/PlanEditor";
import { loadLesson } from "@/lib/lesson";
import { duration, slideSources } from "@/lib/labels";

export const dynamic = "force-dynamic";

const shortTitle = (t: string) => {
  const [week, name] = t.split(" · ");
  return name ? `${name.charAt(0).toLowerCase()}${name.slice(1)} (${week})` : t;
};

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadLesson(id);
  if (!d.plan) notFound();
  const deck = d.lesson.format === "lecture_deck";
  const total = d.plan.slides.reduce((n, s) => n + (s.estDurationSec ?? 0), 0);
  const sections = new Set(d.plan.slides.map((s) => s.section).filter(Boolean)).size;
  const tone = d.preferences.effective.find((i) => i.kind === "tone")?.value;
  const earlier = d.knowledge?.covered.filter((c) => c.lessonId !== id) ?? [];
  const cite = Object.fromEntries(d.plan.slides.map((s) => {
    const c = s.claims.flatMap((x) => x.citations)[0];
    const src = c && d.sources.find((x) => x.id === c.sourceId);
    return [s.slideId, src ? `${src.title}, ${c.locator}` : ""];
  }));

  const view: PlanView = {
    lessonId: id,
    format: d.lesson.format,
    plan: d.plan,
    editable: d.lesson.status === "plan_review",
    summary: deck ? `${d.plan.slides.length} slides · ${sections} sections · ${duration(d.lesson.targetDurationSec)}` : `${d.plan.slides.length} slides · ${duration(total)}`,
    from: Object.fromEntries(d.plan.slides.map((s) => [s.slideId, slideSources(s, d.sources)])),
    cite,
    drafts: d.drafts.map((p) => ({ version: p.version, note: p.revisionRequest?.text })),
    tone,
    courseTitle: d.course.title.split(" · ")[0]!,
    courseId: d.course.id,
    alreadyKnown: earlier.length ? `From your earlier ${d.course.title.split(" · ")[0]} lessons: ${earlier.map((c) => shortTitle(c.lessonTitle)).join(" and ")}. I've pitched the outline to build on these.` : undefined,
    recapFrom: d.plan.recap ? d.repo.get("lessons", d.plan.recap.fromLessonId)?.title.split(" · ")[0] : undefined,
  };

  return (
    <LessonFrame user={d.user} course={d.course} lesson={d.lesson} stage="plan">
      <PlanEditor view={view} />
    </LessonFrame>
  );
}
