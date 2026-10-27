import { notFound, redirect } from "next/navigation";
import { LessonFrame } from "@/components/LessonFrame";
import { VideoPreview } from "@/components/preview/VideoPreview";
import { DeckPreview } from "@/components/preview/DeckPreview";
import { loadLesson } from "@/lib/lesson";

export const dynamic = "force-dynamic";

import type { VisualVersion } from "@/lib/types";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await loadLesson(id);
  if (!d.plan || !d.template) notFound();
  if (!["preview_review", "finalizing", "ready"].includes(d.lesson.status)) redirect(`/lessons/${id}/plan`);
  const drafts = d.artifacts.filter((a) => a.stage === "draft");
  const versions: Record<string, VisualVersion[]> = {};
  const takes: Record<string, number> = {};
  for (const s of d.plan.slides) {
    versions[s.slideId] = drafts.filter((a) => a.slideId === s.slideId && (a.kind === "image" || a.kind === "clip"))
      .sort((a, b) => a.versionNumber - b.versionNumber)
      .map((a) => ({ n: a.versionNumber, note: a.versionNote, chosen: a.chosen, upload: a.origin === "teacher_upload" }));
    takes[s.slideId] = drafts.filter((a) => a.slideId === s.slideId && a.kind === "narration_audio").length;
  }
  const cite = Object.fromEntries(d.plan.slides.map((s) => {
    const c = s.claims.flatMap((x) => x.citations)[0];
    const src = c && d.sources.find((x) => x.id === c.sourceId);
    return [s.slideId, src ? `${src.title}, ${c.locator}` : ""];
  }));
  const props = { lessonId: id, slides: d.plan.slides, template: d.template, versions, editable: d.lesson.status === "preview_review" };

  return (
    <LessonFrame user={d.user} course={d.course} lesson={d.lesson} stage="preview">
      {d.lesson.format === "lecture_deck"
        ? <DeckPreview {...props} cite={cite} courseLabel={`${d.course.title.split(" · ")[0]} · ${d.lesson.title.split(" · ")[0]}`} />
        : <VideoPreview {...props} takes={takes} />}
    </LessonFrame>
  );
}
