import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { z } from "zod";

/** Loads and validates the golden set (see README.md). */
const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const TASKS = ["source_extraction", "planning", "revision", "self_check", "preference_learning"] as const;
export const TARGETS: Record<(typeof TASKS)[number], number> = { source_extraction: 15, planning: 20, revision: 8, self_check: 8, preference_learning: 6 };

const text = z.string().trim().min(1, "fill this in or remove it");
const list = z.array(text);
const common = {
  id: z.string().regex(/^[a-z]{2}-\d{3}-[a-z0-9-]+$/, "use the form pl-007-short-name"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  persona: text,
  why_hard: z.string().optional(),
  notes: z.string().optional(),
};
const source = z.object({
  title: text,
  kind: z.enum(["text", "pdf", "url"]),
  visibility: z.enum(["private", "cited"]).optional(),
  inline: z.string().optional(),
  file: z.string().optional(),
  url: z.string().url().optional(),
}).refine((s) => (s.kind === "text" ? s.inline : s.kind === "pdf" ? s.file : s.url), { message: "text needs inline, pdf needs file, url needs url" });
const starter = z.enum(["detailed_explainer", "live_lecture"]);

export const CaseSchema = z.discriminatedUnion("task", [
  z.object({ ...common, task: z.literal("source_extraction"), source,
    expect: z.object({ must_extract: list.min(1), should_flag_gaps: list, reading_level: z.enum(["beginner", "intermediate", "advanced"]) }) }),
  z.object({ ...common, task: z.literal("planning"),
    teacher: z.object({ starter, audience: text, length_minutes: z.number().positive(), guidelines: list }),
    request: text, sources: z.array(source).min(1), already_known: list,
    expect: z.object({ slides_min: z.number().int().positive(), slides_max: z.number().int().positive(), must_cover: list.min(1), must_not: list, should_flag: list, recap_expected: z.boolean() }) }),
  z.object({ ...common, task: z.literal("revision"), starter, note: text, via: z.enum(["typed", "dictated"]), scope_slide: z.number().int().nullable(),
    expect: z.object({ should_change: z.array(z.number().int()).min(1), must_keep_unchanged: z.array(z.number().int()), must_include: list, must_not: list }) }),
  z.object({ ...common, task: z.literal("self_check"), starter, guidelines: list,
    planted_problems: z.array(z.object({ slide: z.number().int(), kind: z.enum(["uncited_claim", "wrong_fact", "guideline_broken", "jargon", "off_audience"]), description: text })).min(1),
    clean_slides: z.array(z.number().int()) }),
  z.object({ ...common, task: z.literal("preference_learning"), existing_preferences: list, removed_preferences: list,
    edits: z.array(z.object({ lesson: text, did: text })).min(1),
    expect: z.object({ should_learn: list, must_not_learn: list }) }),
]);
export type GoldenCase = z.infer<typeof CaseSchema> & { sections: Record<string, string>; file: string };

function sectionsOf(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  let name: string | null = null;
  for (const line of body.split("\n")) {
    const h = /^##\s+(.+?)\s*$/.exec(line);
    if (h) { name = h[1]!; out[name] = ""; } else if (name) out[name] += `${line}\n`;
  }
  for (const k of Object.keys(out)) out[k] = out[k]!.trim();
  return out;
}

/** Every case file, parsed; problems are returned rather than thrown so the check can list them all. */
export function loadGolden(root = ROOT): { cases: GoldenCase[]; problems: string[] } {
  const cases: GoldenCase[] = [];
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const task of TASKS) {
    const dir = path.join(root, task);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
      const rel = `${task}/${name}`;
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw);
      if (!m) { problems.push(`${rel}: missing the front matter between --- lines`); continue; }
      let data: unknown;
      try { data = parse(m[1]!); } catch (e) { problems.push(`${rel}: front matter isn't valid YAML (${(e as Error).message.split("\n")[0]})`); continue; }
      const parsed = CaseSchema.safeParse(data);
      if (!parsed.success) {
        for (const i of parsed.error.issues) problems.push(`${rel}: ${i.path.join(".") || "(top)"}: ${i.message}`);
        continue;
      }
      const c = { ...parsed.data, sections: sectionsOf(m[2] ?? ""), file: rel } as GoldenCase;
      if (c.task !== task) problems.push(`${rel}: task is "${c.task}" but the file is in ${task}/`);
      if (`${c.id}.md` !== name) problems.push(`${rel}: id "${c.id}" doesn't match the file name`);
      if (ids.has(c.id)) problems.push(`${rel}: duplicate id ${c.id}`);
      ids.add(c.id);
      const srcs = c.task === "source_extraction" ? [c.source] : c.task === "planning" ? c.sources : [];
      for (const s of srcs) {
        if (s.inline && !c.sections[s.inline]) problems.push(`${rel}: no "## ${s.inline}" section with text`);
        if (s.file && !fs.existsSync(path.join(root, s.file))) problems.push(`${rel}: file ${s.file} not found`);
      }
      if (c.task === "planning" && c.expect.slides_min > c.expect.slides_max) problems.push(`${rel}: slides_min is above slides_max`);
      if (c.task === "revision" && !c.sections["Base plan"]) problems.push(`${rel}: needs a "## Base plan" section`);
      if (c.task === "self_check" && !c.sections["Plan"]) problems.push(`${rel}: needs a "## Plan" section`);
      if (c.difficulty === "hard" && !c.why_hard?.trim()) problems.push(`${rel}: hard cases need why_hard`);
      cases.push(c);
    }
  }
  return { cases, problems };
}

/** Cases per task and difficulty, against the targets. */
export function coverage(cases: GoldenCase[]) {
  return TASKS.map((task) => {
    const mine = cases.filter((c) => c.task === task);
    const by = (d: string) => mine.filter((c) => c.difficulty === d).length;
    return { task, easy: by("easy"), medium: by("medium"), hard: by("hard"), total: mine.length, target: TARGETS[task] };
  });
}
