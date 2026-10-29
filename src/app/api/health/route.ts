import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";


export async function GET(request: NextRequest) {
  // Rate limit: 60 requests per minute
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`health_check:${ip}`, 60, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    // If Supabase is configured, verify it answers a tiny query
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("products").select("id").limit(1);
      if (error) {
        console.error("Health check database query error:", error.message);
        return NextResponse.json({ ok: false }, { status: 503 });
      }
    }

    // No secrets in the response
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Health check error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
