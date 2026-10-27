"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Mode } from "@ls/orchestrator";

/** "Try the guided demo" in live mode; "Back to my lessons" in the guided demo. */
export function ModeSwitch({ mode, variant = "link" }: { mode: Mode; variant?: "link" | "button" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const to = mode === "live" ? "guided" : "live";
  async function go() {
    setBusy(true);
    await fetch("/api/mode", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: to }) });
    router.push("/");
    router.refresh();
  }
  return (
    <button type="button" className={variant === "button" ? "btn btn-ghost btn-sm" : "lnk"} onClick={go} disabled={busy} style={variant === "link" ? { minHeight: 0, fontSize: 14 } : undefined}>
      {to === "guided" ? "Try the guided demo" : "Back to my lessons"}
    </button>
  );
}

/** A thin band at the top of every guided-demo screen. */
export function GuidedBanner() {
  return (
    <div role="status" className="row" style={{ justifyContent: "center", gap: 12, padding: "8px 16px", background: "var(--warning-soft)", color: "var(--warning-strong)", fontSize: 14 }}>
      <span>You&apos;re in the guided demo, with two sample teachers. Changes here are just for practice.</span>
      <ModeSwitch mode="guided" />
    </div>
  );
}
