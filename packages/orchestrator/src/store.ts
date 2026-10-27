import fs from "node:fs";
import path from "node:path";
import { cloneStore, createRepo, type Repo, type Store } from "@ls/schema";
import { seed } from "@ls/fixtures";

/**
 * Where data lives:
 * - Locally: one JSON file, data/store.json, created from the seed on first use.
 * - On Vercel (read-only filesystem): an in-memory copy of the seed per visitor,
 *   which can disappear on a cold start. "Reset demo" drops the visitor's copy.
 */
const onVercel = () => Boolean(process.env.VERCEL);

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

/** The repository for this request. */
export function getRepo(visitorId = "local"): Repo {
  return onVercel() ? memoryRepo(visitorId) : fileRepo();
}

/** Restores the seed for this visitor (Vercel) or rewrites the data file (local). */
export function resetDemo(visitorId = "local"): void {
  if (onVercel()) visitors.delete(visitorId);
  else writeSeedToDisk();
}
