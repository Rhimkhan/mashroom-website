import { NextRequest } from "next/server";
import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "akhil_admin_session";
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LockoutRecord {
  failedAttempts: number;
  lockedUntil: number;
}

const lockoutStore = new Map<string, LockoutRecord>();

export const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours (28,800 seconds)

function getAdminSessionSecret(): string {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  if (sessionSecret && sessionSecret.trim() !== "") {
    return sessionSecret.trim();
  }
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[SECURITY WARNING] ADMIN_SESSION_SECRET is not configured in production environment variables! Falling back to ADMIN_PASSWORD."
    );
  }
  return process.env.ADMIN_PASSWORD || "akhil_foods_default_session_secret_key_jhansi";
}

/**
 * Server-side constant-time admin password verification.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;
  const serverAdminPass = process.env.ADMIN_PASSWORD || "admin123";
  const passBuf = Buffer.from(password.trim());
  const serverBuf = Buffer.from(serverAdminPass.trim());
  if (passBuf.length !== serverBuf.length) return false;
  return crypto.timingSafeEqual(passBuf, serverBuf);
}

/**
 * Checks if the given IP address is currently locked out from admin login.
 */
export function checkAdminLockout(ip: string): { isLocked: boolean; remainingMs: number } {
  const record = lockoutStore.get(ip);
  if (!record) return { isLocked: false, remainingMs: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    return { isLocked: true, remainingMs: record.lockedUntil - now };
  }

  // If lockout expired, reset
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    lockoutStore.delete(ip);
  }

  return { isLocked: false, remainingMs: 0 };
}

/**
 * Records a failed login attempt for an IP.
 */
export function recordAdminFailedAttempt(ip: string): { attempts: number; locked: boolean; remainingAttempts: number } {
  const now = Date.now();
  let record = lockoutStore.get(ip);

  if (!record || (record.lockedUntil > 0 && record.lockedUntil <= now)) {
    record = { failedAttempts: 0, lockedUntil: 0 };
  }

  record.failedAttempts += 1;

  if (record.failedAttempts >= LOCKOUT_THRESHOLD) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    lockoutStore.set(ip, record);
    return { attempts: record.failedAttempts, locked: true, remainingAttempts: 0 };
  }

  lockoutStore.set(ip, record);
  return {
    attempts: record.failedAttempts,
    locked: false,
    remainingAttempts: LOCKOUT_THRESHOLD - record.failedAttempts,
  };
}

/**
 * Resets failed attempts after a successful login.
 */
export function resetAdminFailedAttempts(ip: string): void {
  lockoutStore.delete(ip);
}

/**
 * Creates an HMAC-signed session token for the admin cookie (valid for 8 hours).
 */
export function createAdminSessionToken(): string {
  const secret = getAdminSessionSecret();
  const payload = {
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + SESSION_EXPIRY_MS, // 8 hours
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies if the request carries a valid, non-expired admin session cookie.
 */
export function verifyAdminSession(request: NextRequest): boolean {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return false;

  const parts = cookie.value.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  const secret = getAdminSessionSecret();

  const expectedSignature = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (signatureBuf.length !== expectedBuf.length) {
    return false;
  }
  if (!crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
    if (payload.role !== "admin" || !payload.exp || payload.exp < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
