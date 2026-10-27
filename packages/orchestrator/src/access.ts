import { randomBytes, timingSafeEqual } from "node:crypto";
import { AccessCode, type AccessCode as Code } from "@ls/schema";
import { localFile, redis } from "./store";
import { FlowError } from "./lessons";

/**
 * Access codes (Spec 03 "Access and modes"). One code per recipient; the code is
 * also the workspace key. Codes live outside workspaces: Redis on Vercel, data/ locally.
 */
const onVercel = () => Boolean(process.env.VERCEL);
const LOCAL_CODE = "LOCAL";
const DEFAULT_CAP = 1500;

export const normalizeCode = (raw: string) => raw.trim().toUpperCase().replace(/\s+/g, "");

export { signCode, verifySignedCode } from "./signing";

// ---------- Storage ----------
const key = (code: string) => `ls:code:${code}`;
const INDEX = "ls:codes";

async function readCode(code: string): Promise<Code | undefined> {
  if (onVercel()) {
    const raw = (await redis(["GET", key(code)])) as string | null;
    return raw ? AccessCode.parse(JSON.parse(raw)) : undefined;
  }
  const all = localFile.read<Code[]>("codes") ?? [];
  const found = all.find((c) => c.code === code);
  if (found) return found;
  // Locally there's always one code so the app can be opened without setup.
  return code === LOCAL_CODE ? { code, label: "Local development", capCredits: DEFAULT_CAP, active: true, createdAt: new Date().toISOString() } : undefined;
}

async function writeCode(c: Code): Promise<Code> {
  const valid = AccessCode.parse(c);
  if (onVercel()) {
    await redis(["SET", key(valid.code), JSON.stringify(valid)]);
    await redis(["SADD", INDEX, valid.code]);
  } else {
    const all = (localFile.read<Code[]>("codes") ?? []).filter((x) => x.code !== valid.code);
    localFile.write("codes", [...all, valid]);
  }
  return valid;
}

export async function listCodes(): Promise<Code[]> {
  if (onVercel()) {
    const codes = ((await redis(["SMEMBERS", INDEX])) as string[] | null) ?? [];
    const all = await Promise.all(codes.map((c) => readCode(c)));
    return all.filter((c): c is Code => Boolean(c)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return localFile.read<Code[]>("codes") ?? [];
}

/** An active code, or null. */
export async function activeCode(code: string): Promise<Code | null> {
  const c = await readCode(normalizeCode(code));
  return c?.active ? c : null;
}

/** Records a visit (first and last seen) without failing the request if storage hiccups. */
export async function touchCode(c: Code): Promise<void> {
  const now = new Date().toISOString();
  if (c.lastSeenAt && Date.now() - Date.parse(c.lastSeenAt) < 5 * 60_000) return;
  await writeCode({ ...c, firstSeenAt: c.firstSeenAt ?? now, lastSeenAt: now }).catch(() => undefined);
}

/** A readable code like "RW-K7Q2-M9" unless one is given. */
function generateCode(prefix = "LS"): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const part = (o: number) => Array.from(bytes.subarray(o, o + 3), (b) => alphabet[b % alphabet.length]).join("");
  return `${normalizeCode(prefix).replace(/[^A-Z0-9]/g, "").slice(0, 6) || "LS"}-${part(0)}-${part(3)}`;
}

export async function createCode(input: { label: string; code?: string; prefix?: string; capCredits?: number }): Promise<Code> {
  if (!input.label?.trim()) throw new FlowError("Give the code a label, e.g. who it's for");
  const code = input.code ? normalizeCode(input.code) : generateCode(input.prefix);
  if (!/^[A-Z0-9-]{4,40}$/.test(code)) throw new FlowError("Codes use letters, numbers and dashes (4–40 characters)");
  if (await readCode(code)) throw new FlowError("That code already exists");
  return writeCode({ code, label: input.label.trim(), capCredits: input.capCredits ?? DEFAULT_CAP, active: true, createdAt: new Date().toISOString() });
}

export async function updateCode(code: string, patch: Partial<Pick<Code, "label" | "capCredits" | "active">>): Promise<Code> {
  const c = await readCode(normalizeCode(code));
  if (!c) throw new FlowError("Code not found", 404);
  const set = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  return writeCode({ ...c, ...set });
}

/** Owner-only check for admin routes. */
export function isAdmin(token: string | undefined | null): boolean {
  const want = process.env.ADMIN_TOKEN;
  if (!want || !token) return false;
  const a = Buffer.from(token), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
