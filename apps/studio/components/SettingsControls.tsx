"use client";
import { useState } from "react";
import type { PreferenceItem } from "@ls/schema";
import { useCall } from "@/lib/client";
import { Switch } from "./Switch";

type Item = PreferenceItem & { note: string };

export function PreferenceList({ endpoint, items }: { endpoint: string; items: Item[] }) {
  const { call, pending, error } = useCall();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [removed, setRemoved] = useState<PreferenceItem | null>(null);
  const [text, setText] = useState("");

  async function remove(i: Item) {
    const { note: _note, ...item } = i;
    if (await call("PUT", endpoint, { op: "remove", itemId: i.itemId })) setRemoved(item);
  }
  return (
    <div className="stack" style={{ gap: 0 }}>
      {items.map((i) => (
        <div key={i.itemId} className="row-between" style={{ padding: "10px 0", borderTop: "1px solid #EEF0F4" }}>
          <div className="stack" style={{ gap: 2, flex: "1 1 300px" }}>
            {editing === i.itemId ? (
              <label className="stack" style={{ gap: 4, fontSize: 13, color: "var(--muted)" }}>Edit preference
                <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} />
              </label>
            ) : <span style={{ fontWeight: 600, fontSize: 15 }}>{i.kind === "tone" ? `Tone: ${i.value.toLowerCase()}` : i.kind === "citation_style" ? `Citations: ${i.value.toLowerCase()}` : i.value}</span>}
            <span style={{ fontSize: 13, color: i.origin === "teacher" ? "var(--accent-hover)" : "var(--muted)" }}>{i.note}</span>
          </div>
          <div className="row" style={{ gap: 4 }}>
            {editing === i.itemId
              ? <button className="lnk" type="button" disabled={pending} onClick={async () => { if (await call("PUT", endpoint, { op: "edit", itemId: i.itemId, value: draft })) setEditing(null); }}>Save</button>
              : <button className="lnk" type="button" onClick={() => { setEditing(i.itemId); setDraft(i.value); }}>Edit</button>}
            <button className="lnk" type="button" disabled={pending} onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="muted" style={{ margin: "8px 0", fontSize: 14 }}>Nothing here yet.</p>}
      {removed && (
        <div className="note-box row" role="status" style={{ marginTop: 8 }}>Removed. I won&apos;t learn it again.
          <button className="lnk" type="button" style={{ minHeight: 0 }} onClick={async () => { if (await call("PUT", endpoint, { op: "restore", item: removed })) setRemoved(null); }}>Undo</button>
        </div>
      )}
      <form className="row" style={{ marginTop: 12 }} onSubmit={async (e) => { e.preventDefault(); if (await call("PUT", endpoint, { op: "add", value: text })) setText(""); }}>
        <label htmlFor={`new-${endpoint}`} className="visually-hidden">Add a preference</label>
        <input id={`new-${endpoint}`} className="field" style={{ flex: "1 1 320px", width: "auto" }} placeholder="Add a preference, e.g. “Use US spelling”" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-ghost" type="submit" disabled={pending || !text.trim()}>Add</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}

export function AppsList({ apps }: { apps: { id: string; name: string; color: string; connected: boolean }[] }) {
  const { call, pending } = useCall();
  return (
    <div className="grid-2" style={{ gap: 10 }}>
      {apps.map((a) => (
        <div key={a.id} className="row-between" style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "8px 12px" }}>
          <span className="row" style={{ gap: 10 }}>
            <span aria-hidden="true" className="avatar" style={{ background: a.color, borderRadius: 8, width: 32, height: 32 }}>{a.name[0]}</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</span>
          </span>
          {a.id.startsWith("none_") ? <span className="muted" style={{ fontSize: 14 }}>Coming soon</span> : <button className="lnk" type="button" disabled={pending} onClick={() => call("PUT", `/api/integrations/${a.id}`, { connected: !a.connected })}>
            {a.connected ? "Connected · Disconnect" : "Connect"}
          </button>}
        </div>
      ))}
    </div>
  );
}

export function TaskList({ tasks }: { tasks: { id: string; name: string; when: string; enabled: boolean }[] }) {
  const { call, pending } = useCall();
  return (
    <div className="stack" style={{ gap: 0 }}>
      {tasks.map((t) => (
        <div key={t.id} className="row-between" style={{ padding: "10px 0", borderTop: "1px solid #EEF0F4" }}>
          <span className="stack" style={{ gap: 2 }}><span style={{ fontWeight: 600, fontSize: 15 }}>{t.name}</span><span className="muted" style={{ fontSize: 13 }}>{t.when}</span></span>
          <Switch checked={t.enabled} label={t.name} disabled={pending} onChange={(v) => call("PUT", `/api/scheduled-tasks/${t.id}`, { enabled: v })} />
        </div>
      ))}
    </div>
  );
}
