import type { User } from "@ls/schema";

const COLORS: Record<string, string> = { usr_maya: "#2A9D8F", usr_ortiz: "#7A4FB5" };

export function Avatar({ user, withName }: { user: User; withName?: boolean }) {
  const initial = user.name.replace("Dr. ", "")[0] ?? "?";
  return (
    <span className="row" style={{ gap: 8 }}>
      <span className="avatar" style={{ background: COLORS[user.id] ?? "#5A6272" }} aria-label={withName ? undefined : user.name}>{initial}</span>
      {withName && <span style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</span>}
    </span>
  );
}
