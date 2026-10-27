import Link from "next/link";
import { resolvePreferences } from "@ls/orchestrator";
import { AppFrame } from "@/components/AppFrame";
import { AppsList, PreferenceList, TaskList } from "@/components/SettingsControls";
import { coursesOf, session } from "@/lib/server";

export const dynamic = "force-dynamic";

const APP_NAMES: Record<string, [string, string]> = {
  google_drive: ["Google Drive", "#1E8E3E"], youtube: ["YouTube", "#C4302B"], canvas: ["Canvas", "#B5341F"], google_classroom: ["Google Classroom", "#137333"],
  kajabi: ["Kajabi", "#2F55D4"], teachable: ["Teachable", "#1F2937"], dropbox: ["Dropbox", "#0061D5"], notion: ["Notion", "#2B2B2B"],
};

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { repo, user } = await session();
  const courses = coursesOf(repo, user.id);
  const { course: wanted } = await searchParams;
  const course = courses.find((c) => c.id === wanted) ?? courses[0]!;
  const general = resolvePreferences(repo, user.id).general;
  const scoped = resolvePreferences(repo, user.id, course.id);
  const generalById = new Map((general?.items ?? []).map((i) => [i.itemId, i.value]));
  const courseName = (id: string) => courses.find((c) => c.id === id)?.title.split(" · ")[0] ?? "";

  return (
    <AppFrame user={user} courses={courses} current="settings">
      <h1>Settings</h1>
      <section aria-labelledby="prefs" className="card" style={{ padding: "22px 24px", gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h2 id="prefs">Preferences</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>These apply to every course. I learn them from your edits and answers; change or remove anything, and what you set always wins over what I learn. You can also set preferences on the course level, overriding the general preferences.</p>
        </div>
        <PreferenceList endpoint="/api/preferences" items={(general?.items ?? []).map((i) => ({ ...i, note: i.origin === "teacher" ? "Set by you" : `Learned: ${i.evidence ?? "from your edits"}` }))} />
      </section>

      <section aria-labelledby="course-prefs" className="card" style={{ padding: "22px 24px", gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h2 id="course-prefs">Course preferences</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Only for one course. These win over your general preferences in that course.</p>
        </div>
        <div className="row" role="group" aria-label="Choose a course">
          {courses.map((c) => <Link key={c.id} href={`/settings?course=${c.id}`} className="chip" aria-pressed={c.id === course.id} style={{ textDecoration: "none" }}>{c.title.split(" · ")[0]}</Link>)}
        </div>
        <PreferenceList key={course.id} endpoint={`/api/courses/${course.id}/preferences`} items={(scoped.course?.items ?? []).map((i) => ({
          ...i, note: i.overridesItemId && generalById.has(i.overridesItemId) ? `Overrides your general preference: ${generalById.get(i.overridesItemId)!.toLowerCase()}` : i.origin === "teacher" ? "Set by you · only for this course" : `Learned: ${i.evidence ?? "from this course"}`,
        }))} />
      </section>

      <section aria-labelledby="ints" className="card" style={{ padding: "22px 24px", gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h2 id="ints">Connected apps</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Bring in sources and send finished lessons where your students are.</p>
        </div>
        <AppsList apps={repo.list("integrations", (i) => i.ownerId === user.id).map((i) => ({ id: i.id, name: APP_NAMES[i.provider]![0], color: APP_NAMES[i.provider]![1], connected: i.status === "connected" }))} />
      </section>

      <section aria-labelledby="sched" className="card" style={{ padding: "22px 24px", gap: 14 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h2 id="sched">Scheduled tasks</h2>
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>Work I do on a schedule. You approve every plan before anything is made.</p>
        </div>
        <TaskList tasks={repo.list("scheduledTasks", (t) => t.ownerId === user.id).map((t) => ({ id: t.id, name: t.name, when: `${t.cadence} · ${courseName(t.courseId)}`, enabled: t.enabled }))} />
      </section>
    </AppFrame>
  );
}
