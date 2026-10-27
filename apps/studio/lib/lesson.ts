import { notFound } from "next/navigation";
import { FlowError, getLessonContext } from "@ls/orchestrator";
import { session } from "./server";

/** Everything a lesson page needs, for the signed-in demo teacher only. */
export async function loadLesson(id: string) {
  const { repo, user } = await session();
  try {
    const ctx = getLessonContext(repo, id);
    if (ctx.course.ownerId !== user.id) notFound();
    return { ...ctx, user, repo };
  } catch (e) {
    if (e instanceof FlowError) notFound();
    throw e;
  }
}

export type LessonData = Awaited<ReturnType<typeof loadLesson>>;
