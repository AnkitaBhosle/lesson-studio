"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AccessCode } from "@ls/schema";

async function send(method: string, url: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return res.ok ? null : data.error ?? "Something went wrong";
}

export function AdminLogin() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  return (
    <form className="card" style={{ maxWidth: 440 }} onSubmit={async (e) => { e.preventDefault(); const err = await send("POST", "/api/admin/login", { token }); if (err) setError(err); else router.refresh(); }}>
      <label htmlFor="token" style={{ fontWeight: 600, fontSize: 14 }}>Admin token</label>
      <input id="token" className="field" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={!token}>Sign in</button>
    </form>
  );
}

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Never");

export function AdminCodes({ codes }: { codes: AccessCode[] }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [prefix, setPrefix] = useState("RW");
  const [cap, setCap] = useState(15);
  const [error, setError] = useState<string | null>(null);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const err = await send("POST", "/api/admin/codes", { label, prefix, capDollars: cap });
    if (err) return setError(err);
    setLabel(""); setError(null); router.refresh();
  }
  async function patch(code: string, body: object) {
    const err = await send("PATCH", `/api/admin/codes/${encodeURIComponent(code)}`, body);
    if (err) setError(err); else router.refresh();
  }
  return (
    <>
      <form className="card" onSubmit={create}>
        <h2 style={{ fontSize: 17 }}>New code</h2>
        <div className="row" style={{ alignItems: "flex-end", gap: 12 }}>
          <label className="stack" style={{ gap: 4, flex: "2 1 240px", fontSize: 13, color: "var(--muted)" }}>Who it's for
            <input className="field" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Runway, hiring manager" />
          </label>
          <label className="stack" style={{ gap: 4, flex: "0 1 100px", fontSize: 13, color: "var(--muted)" }}>Prefix
            <input className="field" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </label>
          <label className="stack" style={{ gap: 4, flex: "0 1 110px", fontSize: 13, color: "var(--muted)" }}>Cap ($)
            <input className="field" type="number" min={1} value={cap} onChange={(e) => setCap(Number(e.target.value))} />
          </label>
          <button className="btn btn-primary" type="submit" disabled={!label.trim()}>Create</button>
        </div>
        {error && <p className="error" role="alert">{error}</p>}
      </form>
      <div className="list">
        {codes.length === 0 && <div className="list-row muted">No codes yet.</div>}
        {codes.map((c) => (
          <div key={c.code} className="list-row" style={{ alignItems: "flex-start" }}>
            <span className="stack" style={{ gap: 2 }}>
              <span style={{ fontWeight: 700, fontFamily: "ui-monospace, monospace", fontSize: 16 }}>{c.code}</span>
              <span style={{ fontSize: 14 }}>{c.label}</span>
              <span className="muted" style={{ fontSize: 13 }}>Cap ${(c.capCredits / 100).toFixed(0)} · first used {fmt(c.firstSeenAt)} · last used {fmt(c.lastSeenAt)}</span>
            </span>
            <span className="row">
              <span className={`pill ${c.active ? "pill-ok" : "pill-plain"}`}>{c.active ? "Active" : "Turned off"}</span>
              <button className="lnk" type="button" onClick={() => patch(c.code, { active: !c.active })}>{c.active ? "Turn off" : "Turn on"}</button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
