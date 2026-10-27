import Link from "next/link";
import type { Course, User } from "@ls/schema";
import { Avatar } from "./Avatar";
import { Courses, Gear, Grid, Home, Logo } from "./icons";

type Section = "home" | "courses" | "templates" | "settings";

/** Frame for Home, Course, Templates and Settings: top bar plus the full side nav. */
export function AppFrame({ user, courses, current, courseId, children }: { user: User; courses: Course[]; current: Section; courseId?: string; children: React.ReactNode }) {
  const other = user.id === "usr_maya" ? { id: "usr_ortiz", label: "Switch demo to Dr. Ortiz" } : { id: "usr_maya", label: "Switch demo to Maya" };
  const cur = (s: Section) => (s === current && !courseId ? "page" : undefined);
  return (
    <div className="frame">
      <header className="topbar" style={{ padding: "12px 24px" }}>
        <Link href="/" className="brand"><Logo />Lesson Studio</Link>
        <div className="row" style={{ gap: 16 }}>
          <a href={`/switch?to=${other.id}`} style={{ fontSize: 14 }}>{other.label}</a>
          <Avatar user={user} withName />
        </div>
      </header>
      <div className="body">
        <nav aria-label="Main" className="sidenav">
          <Link className="navlink" href="/" aria-current={cur("home")}><Home />Home</Link>
          <span className="navlink" style={{ cursor: "default" }}><Courses />Courses</span>
          {courses.map((c) => (
            <Link key={c.id} className="navlink navsub" href={`/courses/${c.id}`} aria-current={c.id === courseId ? "page" : undefined}>{c.title.split(" · ")[0]}</Link>
          ))}
          <Link className="navlink" href="/templates" aria-current={cur("templates")}><Grid />Templates</Link>
          <Link className="navlink" href="/settings" aria-current={cur("settings")}><Gear />Settings</Link>
        </nav>
        <main className="page"><div className="page-inner">{children}</div></main>
      </div>
    </div>
  );
}
