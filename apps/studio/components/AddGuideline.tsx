"use client";
import { useState } from "react";
import { useCall } from "@/lib/client";

export function AddGuideline({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const { call, pending, error } = useCall();
  if (!open) return <button className="lnk" type="button" style={{ alignSelf: "flex-start", paddingLeft: 0 }} onClick={() => setOpen(true)}>Add a guideline</button>;
  return (
    <form className="stack" style={{ gap: 8 }} onSubmit={async (e) => { e.preventDefault(); if (await call("POST", `/api/courses/${courseId}/guidelines`, { text })) { setText(""); setOpen(false); } }}>
      <label htmlFor="guideline" className="visually-hidden">New guideline</label>
      <input id="guideline" className="field" placeholder="e.g. “Use metric units”" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row"><button className="btn btn-ghost btn-sm" type="submit" disabled={pending}>Add</button><button className="lnk" type="button" onClick={() => setOpen(false)}>Cancel</button></div>
      {error && <p className="error" role="alert">{error}</p>}
    </form>
  );
}
