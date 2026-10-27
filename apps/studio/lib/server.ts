import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { openRepo } from "@ls/orchestrator";
import type { Repo, User } from "@ls/schema";

export const USERS = ["usr_maya", "usr_ortiz"] as const;

export async function session(): Promise<{ repo: Repo; save: () => Promise<void>; user: User; visitorId: string }> {
  const jar = await cookies();
  const visitorId = jar.get("ls_vid")?.value ?? "local";
  const { repo, save } = await openRepo(visitorId);
  const wanted = jar.get("ls_user")?.value;
  const user = repo.get("users", USERS.includes(wanted as never) ? wanted! : "usr_maya");
  if (!user) notFound();
  return { repo, save, user, visitorId };
}

export const coursesOf = (repo: Repo, userId: string) => repo.list("courses", (c) => c.ownerId === userId);
