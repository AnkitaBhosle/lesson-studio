const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true } as const;

export const Logo = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><rect width="30" height="30" rx="8" fill="#3442C9" /><path d="M8 9.5c2.5-1 5-1 7 .5 2-1.5 4.5-1.5 7-.5v11c-2.5-1-5-1-7 .5-2-1.5-4.5-1.5-7-.5z" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" /><path d="M15 10v11" stroke="#fff" strokeWidth="1.8" /></svg>
);
export const Home = () => <svg {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
export const Courses = () => <svg {...p}><path d="M4 5h7v14H4zM13 5h7v14h-7z" /></svg>;
export const Grid = () => <svg {...p}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>;
export const Gear = () => <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
export const Arrow = () => <svg {...p} width={16} height={16} strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Check = ({ size = 18 }: { size?: number }) => <svg {...p} width={size} height={size} stroke="#0F766E" strokeWidth={2.4}><path d="M5 12l5 5 9-10" /></svg>;
export const Tick = () => <svg {...p} width={16} height={16} strokeWidth={2.6}><path d="M5 12l5 5 9-10" /></svg>;
export const Mic = ({ size = 14 }: { size?: number }) => <svg {...p} width={size} height={size} strokeWidth={2.2}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>;
export const Paste = () => <svg {...p}><path d="M8 4h8M8 4v16h8V4M10 9h4M10 13h4" /></svg>;
export const Upload = () => <svg {...p}><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>;
export const LinkIcon = () => <svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>;
export const Drive = () => <svg {...p}><path d="M4 19h16l-5-9-3 5-2-3z" /></svg>;
export const Play = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5l12 7-12 7z" /></svg>;
export const Pause = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>;
export const Grip = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#8A93A5" aria-hidden="true"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>;
export const Done = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.4" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M7 12l3.5 3.5L17 9" /></svg>;
