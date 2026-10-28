import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  checkAdminLockout,
  createAdminSessionToken,
  recordAdminFailedAttempt,
  resetAdminFailedAttempts,
  SESSION_MAX_AGE_SECONDS,
  SESSION_EXPIRY_MS,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate limiting on login attempts (max 10 requests per minute per IP)
    const rateLimit = checkRateLimit(`admin_login:${ip}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many login attempts. Please wait 1 minute before trying again.",
        },
        { status: 429 }
      );
    }

    // 2. Lockout check (5 failed attempts locks out for 15 minutes)
    const lockout = checkAdminLockout(ip);
    if (lockout.isLocked) {
      const minutesRemaining = Math.ceil(lockout.remainingMs / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Account locked due to 5 consecutive failed login attempts. Please try again in ${minutesRemaining} minute${minutesRemaining > 1 ? "s" : ""}.`,
          isLocked: true,
          remainingMinutes: minutesRemaining,
        },
        { status: 423 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { password } = body || {};
    if (!password || typeof password !== "string" || password.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    // Verify ADMIN_PASSWORD only on the server
    if (!verifyAdminPassword(password)) {
      const failure = recordAdminFailedAttempt(ip);

      if (failure.locked) {
        return NextResponse.json(
          {
            success: false,
            error: "Maximum failed attempts reached. Admin access is locked for 15 minutes.",
            isLocked: true,
            remainingMinutes: 15,
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Invalid admin password. ${failure.remainingAttempts} attempt${failure.remainingAttempts === 1 ? "" : "s"} remaining before lockout.`,
          remainingAttempts: failure.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Success: Reset lockout attempts & set httpOnly session cookie
    resetAdminFailedAttempts(ip);
    const token = createAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS, // 8 hours
      expires: new Date(Date.now() + SESSION_EXPIRY_MS),
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred during login." },
      { status: 500 }
    );
  }
}
