import fs from "node:fs";
import path from "node:path";
import { cloneStore, createRepo, type Repo, type Store } from "@ls/schema";
import { liveSeed, seed } from "@ls/fixtures";

/**
 * Where data lives (Spec 05 §1). A workspace is one access code in one mode:
 * - live: starts empty (Spec 04 §10) and is never reset by the app.
 * - guided: starts as a copy of the Maya / Dr. Ortiz seed; Reset restores it.
 * On Vercel each workspace is one Redis key (Upstash REST API), so every serverless
 * instance sees the same state. Locally each workspace is a JSON file in data/.
 */
export type Mode = "live" | "guided";
export interface Workspace { code: string; mode: Mode }

const onVercel = () => Boolean(process.env.VERCEL);
const dataDir = () => process.env.LS_DATA_DIR ?? path.join(process.cwd(), "data");
const workspaceKey = (w: Workspace) => `ls:ws:${w.mode}:${w.code}`;
const seedFor = (mode: Mode) => cloneStore(mode === "guided" ? seed : liveSeed);

export const redisConfigured = () => Boolean((process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL) && (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN));

/** One Redis command over the Upstash REST API. */
export async function redis(command: (string | number)[]): Promise<unknown> {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  const res = await fetch(url!, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Storage request failed (${res.status})`);
  return ((await res.json()) as { result: unknown }).result;
}

/** Small JSON documents in data/ for local runs (workspaces and site settings). */
export const localFile = {
  path: (name: string) => path.join(dataDir(), `${name.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`),
  read<T>(name: string): T | undefined {
    const f = localFile.path(name);
    return fs.existsSync(f) ? (JSON.parse(fs.readFileSync(f, "utf8")) as T) : undefined;
  },
  write(name: string, value: unknown) {
    fs.mkdirSync(dataDir(), { recursive: true });
    fs.writeFileSync(localFile.path(name), JSON.stringify(value, null, 2));
  },
  remove(name: string) {
    const f = localFile.path(name);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  },
};

export interface OpenRepo { repo: Repo; save: () => Promise<void> }

/** The repository for one workspace. Call save() after writes. */
export async function openRepo(w: Workspace): Promise<OpenRepo> {
  const key = workspaceKey(w);
  if (onVercel()) {
    if (!redisConfigured()) throw new Error("Storage isn't configured");
    const raw = (await redis(["GET", key])) as string | null;
    const store = raw ? (JSON.parse(raw) as Store) : seedFor(w.mode);
    let dirty = false;
    const repo = createRepo(store, () => { dirty = true; });
    return { repo, save: async () => { if (dirty) await redis(["SET", key, JSON.stringify(store)]); } };
  }
  const store = localFile.read<Store>(key) ?? seedFor(w.mode);
  const repo = createRepo(store, (s) => localFile.write(key, s));
  return { repo, save: async () => {} };
}

/** Restores the guided demo for this code. Live workspaces are never reset by the app. */
export async function resetGuided(code: string): Promise<void> {
  const key = workspaceKey({ code, mode: "guided" });
  if (onVercel()) await redis(["DEL", key]);
  else localFile.remove(key);
}

/** Writes the guided seed to disk (npm run seed:reset). */
export function writeSeedToDisk(code = "LOCAL"): string {
  const key = workspaceKey({ code, mode: "guided" });
  localFile.write(key, seed);
  return localFile.path(key);
}
