import { EnterForm } from "@/components/EnterForm";
import { Logo } from "@/components/icons";

export const metadata = { title: "Lesson Studio" };

export default function EnterPage() {
  return (
    <main className="frame" style={{ alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: "32px 28px", gap: 18 }}>
        <div className="brand"><Logo />Lesson Studio</div>
        <div className="stack" style={{ gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>Turn what you know into a lesson</h1>
          <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Bring your notes and readings. Lesson Studio plans the lesson with you, then makes the video or slides.</p>
        </div>
        <EnterForm />
      </div>
    </main>
  );
}
