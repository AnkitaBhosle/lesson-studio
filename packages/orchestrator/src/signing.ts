import { createHmac, timingSafeEqual } from "node:crypto";

/** Signs and checks the access-code cookie. Kept dependency-free so the request proxy can import it. */
function secret(): string {
  const s = process.env.ACCESS_COOKIE_SECRET;
  if (s) return s;
  if (process.env.VERCEL) throw new Error("ACCESS_COOKIE_SECRET is not set");
  return "local-development-only";
}

const mac = (code: string) => createHmac("sha256", secret()).update(code).digest("base64url");

/** The cookie value for a code: CODE.signature. */
export const signCode = (code: string) => `${code}.${mac(code)}`;

/** The code if the cookie value is genuine, otherwise null. Says nothing about whether the code is still active. */
export function verifySignedCode(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const code = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const want = Buffer.from(mac(code));
  return given.length === want.length && timingSafeEqual(given, want) ? code : null;
}
