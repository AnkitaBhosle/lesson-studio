import { SiteLimits, type SiteLimits as Limits } from "@ls/schema";
import { localFile, redis } from "./store";
import { activeCode } from "./access";

/**
 * Spend gate (Spec 03 "Spend gate"). Checked before every paid call in live mode;
 * counters move after each call. Redis on Vercel, a local file otherwise.
 * Credits: 1 credit = $0.01. Counters keep fractions (LLM calls cost fractions of a credit).
 */
const onVercel = () => Boolean(process.env.VERCEL);
export const DEFAULT_LIMITS: Limits = { totalCredits: 20000, dailyCredits: 4000, warnAtFraction: 0.75, liveEnabled: true, clipsPerLesson: 2 };

export type PauseReason = "switched_off" | "total" | "daily" | "code";
export const PAUSED_MESSAGE = "Lesson Studio isn't making new lessons right now. You can keep editing, or try the guided demo.";

export class SpendPaused extends Error {
  constructor(public reason: PauseReason) { super(PAUSED_MESSAGE); }
}

const today = () => new Date().toISOString().slice(0, 10);
const K = { limits: "ls:limits", total: "ls:spend:total", day: (d: string) => `ls:spend:day:${d}`, code: (c: string) => `ls:spend:code:${c}` };

type Local = { limits?: Limits; total: number; byDay: Record<string, number>; byCode: Record<string, number> };
const readLocal = (): Local => localFile.read<Local>("spend") ?? { total: 0, byDay: {}, byCode: {} };

export async function getLimits(): Promise<Limits> {
  if (onVercel()) {
    const raw = (await redis(["GET", K.limits])) as string | null;
    return raw ? SiteLimits.parse(JSON.parse(raw)) : DEFAULT_LIMITS;
  }
  return readLocal().limits ?? DEFAULT_LIMITS;
}

export async function setLimits(patch: Partial<Limits>): Promise<Limits> {
  const next = SiteLimits.parse({ ...(await getLimits()), ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) });
  if (onVercel()) await redis(["SET", K.limits, JSON.stringify(next)]);
  else localFile.write("spend", { ...readLocal(), limits: next });
  return next;
}

export async function getSpend(code?: string): Promise<{ total: number; today: number; code: number }> {
  if (onVercel()) {
    const [t, d, c] = await Promise.all([redis(["GET", K.total]), redis(["GET", K.day(today())]), code ? redis(["GET", K.code(code)]) : Promise.resolve("0")]);
    return { total: Number(t ?? 0), today: Number(d ?? 0), code: Number(c ?? 0) };
  }
  const l = readLocal();
  return { total: l.total, today: l.byDay[today()] ?? 0, code: code ? l.byCode[code] ?? 0 : 0 };
}

/** Throws SpendPaused when any limit says stop. */
export async function checkSpend(code: string): Promise<void> {
  if (process.env.LIVE_ENABLED === "false") throw new SpendPaused("switched_off");
  const [limits, spend, access] = await Promise.all([getLimits(), getSpend(code), activeCode(code)]);
  if (!limits.liveEnabled) throw new SpendPaused("switched_off");
  if (spend.total >= limits.totalCredits) throw new SpendPaused("total");
  if (spend.today >= limits.dailyCredits) throw new SpendPaused("daily");
  if (!access || spend.code >= access.capCredits) throw new SpendPaused("code");
}

export async function recordSpend(code: string, credits: number): Promise<void> {
  if (credits <= 0) return;
  if (onVercel()) {
    await Promise.all([
      redis(["INCRBYFLOAT", K.total, credits]),
      redis(["INCRBYFLOAT", K.day(today()), credits]),
      redis(["INCRBYFLOAT", K.code(code), credits]),
    ]);
    return;
  }
  const l = readLocal();
  localFile.write("spend", { ...l, total: l.total + credits, byDay: { ...l.byDay, [today()]: (l.byDay[today()] ?? 0) + credits }, byCode: { ...l.byCode, [code]: (l.byCode[code] ?? 0) + credits } });
}
