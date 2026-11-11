import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyAdminSession } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalWholesaleInquiries, saveLocalWholesaleInquiries } from "@/lib/store";
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

/**
 * DELETE /api/admin/wholesale
 * Admin-only: permanently deletes a wholesale inquiry by id.
 */
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_wholesale_delete:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many delete requests. Please wait 1 minute." },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = (searchParams.get("id") || "").trim();
    if (!id) {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        if (typeof body?.id === "string") id = body.id.trim();
      } catch {
        // ignore
      }
    }
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Wholesale inquiry ID required" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (process.env.NODE_ENV === "production" && (!isSupabaseConfigured || !supabase)) {
      return NextResponse.json(
        { success: false, error: "Database offline. Inquiry cannot be deleted in production." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    let deletedInDb = false;
    if (isSupabaseConfigured && supabase) {
      const { data, error: deleteError } = await supabase
        .from("wholesale_inquiries")
        .delete()
        .eq("id", id)
        .select("id");

      if (deleteError) {
        console.error("Admin wholesale DELETE error:", deleteError.message);
        return NextResponse.json(
          { success: false, error: `Failed to delete inquiry: ${deleteError.message}` },
          { status: 500, headers: NO_STORE_HEADERS }
        );
      }

      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { success: false, error: "Inquiry not found or already deleted." },
            { status: 404, headers: NO_STORE_HEADERS }
          );
        }
      } else {
        deletedInDb = true;
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const current = getLocalWholesaleInquiries();
      const existsLocally = current.some((w) => w.id === id);
      if (!deletedInDb && !existsLocally) {
        return NextResponse.json(
          { success: false, error: "Inquiry not found or already deleted." },
          { status: 404, headers: NO_STORE_HEADERS }
        );
      }
      if (existsLocally) {
        saveLocalWholesaleInquiries(current.filter((w) => w.id !== id));
      }
    }

    return NextResponse.json(
      { success: true, deletedId: id, message: "Item deleted successfully" },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Admin wholesale DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete wholesale inquiry" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
