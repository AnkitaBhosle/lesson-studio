"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCall } from "@/lib/client";
import { Arrow, Drive, LinkIcon, Paste, Upload } from "./icons";

/** Live mode: paste notes or add a link. Uploads and connected apps arrive later. */
export function AddSources({ lessonId }: { lessonId: string }) {
  const { call, pending, error } = useCall();
  const [open, setOpen] = useState<"text" | "url" | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const ok = await call("POST", `/api/lessons/${lessonId}/sources`, open === "text" ? { kind: "text", title, text } : { kind: "url", title, url });
    if (ok) { setOpen(null); setTitle(""); setText(""); setUrl(""); }
  }
  return (
    <div className="stack" style={{ gap: 10 }}>
      <button className="addsrc" type="button" aria-expanded={open === "text"} onClick={() => setOpen(open === "text" ? null : "text")}><Paste />Paste text</button>
      <button className="addsrc" type="button" aria-expanded={open === "url"} onClick={() => setOpen(open === "url" ? null : "url")}><LinkIcon />Add a link</button>
      {open && (
        <form className="card" style={{ padding: 14, gap: 8 }} onSubmit={add}>
          <label className="stack" style={{ gap: 4, fontSize: 13, color: "var(--muted)" }}>Name (optional)
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={open === "text" ? "My notes" : "The page's name"} />
          </label>
          {open === "text" ? (
            <label className="stack" style={{ gap: 4, fontSize: 13, color: "var(--muted)" }}>Your notes, an outline, or a reading
              <textarea className="field" rows={8} value={text} onChange={(e) => setText(e.target.value)} placeholder="Messy is fine." />
            </label>
          ) : (
            <label className="stack" style={{ gap: 4, fontSize: 13, color: "var(--muted)" }}>Link
              <input className="field" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
            </label>
          )}
          <button className="btn btn-primary btn-sm" type="submit" disabled={pending}>Add</button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
      )}
      <button className="addsrc" type="button" disabled title="Coming soon"><Upload />Upload a file · soon</button>
      <button className="addsrc" type="button" disabled title="Coming soon"><Drive />From Google Drive · soon</button>
      <p className="muted" style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5 }}>Notes, outlines, readings. Messy is fine.</p>
    </div>
  );
}

/** Live mode: the first draft of the plan, built from the sources. */
export function PlanButton({ lessonId, label, ready }: { lessonId: string; label: string; ready: boolean }) {
  const router = useRouter();
  const { plan, pending, error } = useCall();
  return (
    <div className="stack" style={{ gap: 8 }}>
      <button className="btn btn-primary" type="button" disabled={pending || !ready}
        onClick={async () => { if (await plan(lessonId, "plan")) router.push(`/lessons/${lessonId}/plan`); }}>
        {pending ? "Planning…" : label} <Arrow />
      </button>
      {pending && <span className="muted" role="status" style={{ fontSize: 13 }}>Reading your notes and drafting the lesson. This takes about a minute.</span>}
      {!ready && <span className="muted" style={{ fontSize: 13 }}>Add your notes first, so the plan is built from what you know.</span>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}
