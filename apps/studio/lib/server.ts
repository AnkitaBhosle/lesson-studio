import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { activeCode, openRepo, touchCode, verifySignedCode, type Mode } from "@ls/orchestrator";
import type { Repo, User } from "@ls/schema";

export const GUIDED_USERS = ["usr_maya", "usr_ortiz"] as const;

export interface Session { repo: Repo; save: () => Promise<void>; user: User; code: string; mode: Mode }

export class NoAccess extends Error {}

/** The visitor's workspace: their access code in live or guided mode. */
export async function loadSession(): Promise<Session> {
  const jar = await cookies();
  const code = verifySignedCode(jar.get("ls_code")?.value);
  const access = code ? await activeCode(code) : null;
  if (!access) throw new NoAccess();
  void touchCode(access);
  const mode: Mode = jar.get("ls_mode")?.value === "guided" ? "guided" : "live";
  const { repo, save } = await openRepo({ code: access.code, mode });
  const wanted = jar.get("ls_user")?.value;
  const userId = mode === "live" ? "usr_you" : GUIDED_USERS.includes(wanted as never) ? wanted! : "usr_maya";
  const user = repo.get("users", userId);
  if (!user) notFound();
  return { repo, save, user, code: access.code, mode };
}

/** For pages: sends visitors without a working code back to the Enter screen. */
export async function session(): Promise<Session> {
  try {
    return await loadSession();
  } catch (e) {
    if (e instanceof NoAccess) redirect("/enter");
    throw e;
  }
}

export const coursesOf = (repo: Repo, userId: string) => repo.list("courses", (c) => c.ownerId === userId);
