import fs from "node:fs";
import path from "node:path";
import { cloneStore, createRepo, type Repo, type Store } from "@ls/schema";
import { seed } from "@ls/fixtures";

/**
 * Where data lives:
 * - Locally: one JSON file, data/store.json, created from the seed on first use.
 * - On Vercel: one copy of the seed per visitor in Redis (Upstash REST API),
 *   so every serverless instance sees the same state. Copies expire after a week.
 * - On Vercel without Redis configured: an in-memory copy per instance (state can
 *   be lost between requests; only a fallback).
 */
const onVercel = () => Boolean(process.env.VERCEL);
const redisUrl = () => process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const redisToken = () => process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL_SECONDS = 60 * 60 * 24 * 7;
const key = (visitorId: string) => `ls:v1:${visitorId}`;

const dataFile = () => path.join(process.env.LS_DATA_DIR ?? path.join(process.cwd(), "data"), "store.json");

export function writeSeedToDisk(file = dataFile()): string {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(seed, null, 2));
  return file;
}

function fileRepo(): Repo {
  const file = dataFile();
  if (!fs.existsSync(file)) writeSeedToDisk(file);
  const store = JSON.parse(fs.readFileSync(file, "utf8")) as Store;
  return createRepo(store, (s) => fs.writeFileSync(file, JSON.stringify(s, null, 2)));
}

const visitors = new Map<string, Store>();
const MAX_VISITORS = 500;

function memoryRepo(visitorId: string): Repo {
  let store = visitors.get(visitorId);
  if (!store) {
    if (visitors.size >= MAX_VISITORS) visitors.delete(visitors.keys().next().value as string);
    store = cloneStore(seed);
    visitors.set(visitorId, store);
  }
  return createRepo(store);
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(redisUrl()!, {
    method: "POST",
    headers: { authorization: `Bearer ${redisToken()}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Storage request failed (${res.status})`);
  return ((await res.json()) as { result: unknown }).result;
}

export interface OpenRepo { repo: Repo; save: () => Promise<void> }

/** The repository for this request. Call save() after writes. */
export async function openRepo(visitorId = "local"): Promise<OpenRepo> {
  if (onVercel() && redisUrl() && redisToken()) {
    const raw = (await redis(["GET", key(visitorId)])) as string | null;
    const store = raw ? (JSON.parse(raw) as Store) : cloneStore(seed);
    let dirty = false;
    const repo = createRepo(store, () => { dirty = true; });
    return { repo, save: async () => { if (dirty) await redis(["SET", key(visitorId), JSON.stringify(store), "EX", TTL_SECONDS]); } };
  }
  return { repo: onVercel() ? memoryRepo(visitorId) : fileRepo(), save: async () => {} };
}

/** Restores the seed for this visitor. */
export async function resetDemo(visitorId = "local"): Promise<void> {
  if (onVercel() && redisUrl() && redisToken()) await redis(["DEL", key(visitorId)]);
  else if (onVercel()) visitors.delete(visitorId);
  else writeSeedToDisk();
}
