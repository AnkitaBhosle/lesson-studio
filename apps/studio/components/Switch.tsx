"use client";

export function Switch({ checked, label, onChange, children, disabled }: { checked: boolean; label: string; onChange: (v: boolean) => void; children?: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" role="switch" className="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}>
      {children}
      <span className="track" aria-hidden="true"><span className="knob" /></span>
    </button>
  );
}
