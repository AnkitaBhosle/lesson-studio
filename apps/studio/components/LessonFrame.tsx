import Link from "next/link";
import type { Course, Lesson, User } from "@ls/schema";
import type { Mode } from "@ls/orchestrator";
import { GuidedBanner } from "./ModeSwitch";
import { Avatar } from "./Avatar";
import { Gear, Grid, Home, Logo, Tick } from "./icons";

export type Stage = "sources" | "plan" | "preview" | "final";
const STAGES: { key: Stage; label: string }[] = [
  { key: "sources", label: "Sources" }, { key: "plan", label: "Plan" }, { key: "preview", label: "Preview" }, { key: "final", label: "Final" },
];

/** Which stages this lesson has reached, from its status. */
export function reachable(lesson: Lesson): Set<Stage> {
  const s = new Set<Stage>(["sources"]);
  if (lesson.currentPlanId) s.add("plan");
  if (["preview_review", "finalizing", "ready"].includes(lesson.status)) s.add("preview");
  if (lesson.status === "ready") s.add("final");
  return s;
}

export function LessonFrame({ user, course, lesson, stage, mode, children }: { user: User; course: Course; lesson: Lesson; stage: Stage; mode: Mode; children: React.ReactNode }) {
  const can = reachable(lesson);
  const at = STAGES.findIndex((s) => s.key === stage);
  return (
    <div className="frame">
      {mode === "guided" && <GuidedBanner />}
      <header className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <Link href="/" aria-label="Lesson Studio home" style={{ display: "inline-flex" }}><Logo /></Link>
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link href={`/courses/${course.id}`}>{course.title.split(" · ")[0]}</Link> <span aria-hidden="true">/</span> <strong>{lesson.title}</strong>
          </nav>
        </div>
        <ol aria-label="Lesson stages" className="stages">
          {STAGES.map((s, i) => {
            const href = `/lessons/${lesson.id}/${s.key}`;
            if (s.key === stage) return <li key={s.key}><span className="stage stage-current" aria-current="step"><span className="num">{i + 1}</span>{s.label}</span></li>;
            if (!can.has(s.key)) return <li key={s.key}><span className="stage"><span className="num">{i + 1}</span>{s.label}</span></li>;
            if (i < at) return <li key={s.key}><Link className="stage stage-done" href={href}><Tick />{s.label}</Link></li>;
            return <li key={s.key}><Link className="stage" href={href}><span className="num">{i + 1}</span>{s.label}</Link></li>;
          })}
        </ol>
        <Avatar user={user} />
      </header>
      <div className="body">
        <nav aria-label="Main" className="rail">
          <Link href="/" aria-label="Home"><Home /></Link>
          <Link href="/templates" aria-label="Templates"><Grid /></Link>
          <Link href="/settings" aria-label="Settings"><Gear /></Link>
        </nav>
        <div className="workspace">{children}</div>
      </div>
    </div>
  );
}
