import { AppFrame } from "@/components/AppFrame";
import { TemplateGrid } from "@/components/TemplateGrid";
import { coursesOf, session } from "@/lib/server";

export const dynamic = "force-dynamic";

const BLURB: Record<string, [string, string]> = {
  tpl_maya: ["Teal and coral, rounded type, warm narration. Videos.", "Stop hunting for the needle."],
  tpl_bright: ["Bold color, friendly shapes, upbeat voice. Videos.", "Big idea, simply."],
  tpl_univ: ["Navy and gold, serif headings, citation footer. Decks.", "Inside the chloroplast"],
  tpl_calm: ["Quiet palette, lots of space, slow pacing. Videos and decks.", "One idea per screen"],
  tpl_field: ["High contrast, numbered steps, readable at a distance. Training aids.", "Check the perimeter"],
};

export default async function TemplatesPage() {
  const { repo, user } = await session();
  const courses = coursesOf(repo, user.id);
  const templates = repo.list("templates", (t) => t.origin === "curated" || t.ownerId === user.id).map((t) => ({
    id: t.id, name: t.name, colors: t.colors, heading: t.fonts.heading, formats: t.formats,
    blurb: BLURB[t.id]?.[0] ?? t.voiceAndTone, sample: BLURB[t.id]?.[1] ?? t.name,
    fromBrand: t.origin === "from_brand",
    usedFor: courses.filter((c) => c.defaultTemplateId === t.id).map((c) => c.title.split(" · ")[0]!),
  }));
  return (
    <AppFrame user={user} courses={courses} current="templates">
      <div className="stack" style={{ gap: 8 }}>
        <h1>Templates</h1>
        <p className="muted" style={{ margin: 0, fontSize: 16, maxWidth: 720, lineHeight: 1.5 }}>How your lessons look and sound: layouts, type, colors, motion and narration voice. I pick one for each lesson. Switch any time.</p>
      </div>
      <TemplateGrid templates={templates} />
    </AppFrame>
  );
}
