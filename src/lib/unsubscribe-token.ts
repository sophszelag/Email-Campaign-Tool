import { createHmac, timingSafeEqual } from "node:crypto";

// Signs an email address so the public unsubscribe link doesn't need an
// active login, but can't be forged into unsubscribing someone else.
function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set (also used to sign unsubscribe links).");
  }
  return secret;
}

export function signUnsubscribeToken(email: string): string {
  return createHmac("sha256", getSecret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = signUnsubscribeToken(email);
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(token, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return timingSafeEqual(expectedBuf, providedBuf);
}

export function buildUnsubscribeUrl(email: string): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const token = signUnsubscribeToken(email);
  const params = new URLSearchParams({ email, token });
  return `${base}/api/unsubscribe?${params.toString()}`;
}
