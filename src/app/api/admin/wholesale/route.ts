import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyAdminSession } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalWholesaleInquiries } from "@/lib/store";
import { WholesaleInquiry } from "@/lib/types";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
};

/**
 * GET /api/admin/wholesale
 * Admin-only: fetches wholesale inquiries fresh with no-store.
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_wholesale_get:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("wholesale_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const inquiries: WholesaleInquiry[] = data.map((d: Record<string, unknown>) => ({
          id: String(d.id ?? ""),
          businessName: String(d.business_name ?? d.businessName ?? "Business"),
          contactPerson: String(d.contact_person ?? d.contactPerson ?? "-"),
          phone: String(d.phone ?? "-"),
          city: String(d.city ?? "-"),
          quantityNeeded: String(d.quantity_needed ?? d.quantityNeeded ?? "-"),
          message: String(d.message ?? "-"),
          createdAt: String(d.created_at ?? d.createdAt ?? new Date().toISOString()),
        }));
        return NextResponse.json(
          { success: true, inquiries },
          { headers: NO_STORE_HEADERS }
        );
      }

      if (error) {
        const tableMissing =
          error.code === "42P01" ||
          /relation .* does not exist/i.test(error.message || "");
        if (tableMissing) {
          return NextResponse.json(
            {
              success: true,
              inquiries: [],
              tableMissing: true,
              warning: "Supabase table 'public.wholesale_inquiries' does not exist yet.",
            },
            { headers: NO_STORE_HEADERS }
          );
        }
      }
    }

    const local = getLocalWholesaleInquiries();
    return NextResponse.json(
      { success: true, inquiries: local },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      (error as { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("Admin wholesale GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wholesale inquiries" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
