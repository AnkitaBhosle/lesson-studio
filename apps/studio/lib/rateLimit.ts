import { redis, redisConfigured } from "@ls/orchestrator";

const local = new Map<string, { n: number; until: number }>();

/** True when this key has been used more than `max` times in `windowSec`. */
export async function tooManyTries(key: string, max: number, windowSec: number): Promise<boolean> {
  if (process.env.VERCEL && redisConfigured()) {
    const n = (await redis(["INCR", `ls:rl:${key}`])) as number;
    if (n === 1) await redis(["EXPIRE", `ls:rl:${key}`, windowSec]);
    return n > max;
  }
  const now = Date.now();
  const e = local.get(key);
  if (!e || e.until < now) { local.set(key, { n: 1, until: now + windowSec * 1000 }); return false; }
  e.n += 1;
  return e.n > max;
}
