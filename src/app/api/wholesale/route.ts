import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp, escapeAndTrim } from "@/lib/rate-limit";
import { verifyAdminSession } from "@/lib/admin-auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getLocalWholesaleInquiries, addLocalWholesaleInquiry } from "@/lib/store";
import { WholesaleInquiry } from "@/lib/types";

/**
 * GET /api/wholesale
 * Admin-only: list all wholesale inquiries
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`admin_wholesale_get:${ip}`, 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
    }

    if (!verifyAdminSession(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("wholesale_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const inquiries: WholesaleInquiry[] = data.map((d: any) => ({
          id: d.id,
          businessName: d.business_name,
          contactPerson: d.contact_person,
          phone: d.phone,
          city: d.city,
          quantityNeeded: d.quantity_needed,
          message: d.message,
          createdAt: d.created_at,
        }));
        return NextResponse.json({ success: true, inquiries });
      }
    }

    const local = getLocalWholesaleInquiries();
    return NextResponse.json({ success: true, inquiries: local });
  } catch (error) {
    console.error("Wholesale GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

/**
 * POST /api/wholesale
 * Public wholesale inquiry submission with honeypot, IP rate limiting and validation.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`wholesale_post:${ip}`, 5, 60 * 60 * 1000); // 5 per hour
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Inquiry limit reached. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 1. Honeypot check
    if (body.website_url || body.company_fax || body.honeypot) {
      return NextResponse.json(
        { success: false, error: "Bot activity detected. Submission rejected." },
        { status: 400 }
      );
    }

    // 2. Server validation
    const rawBusinessName = (body.businessName || "").trim();
    if (rawBusinessName.length < 2 || rawBusinessName.length > 100) {
      return NextResponse.json(
        { success: false, error: "Please enter your business or company name (between 2 and 100 characters)." },
        { status: 400 }
      );
    }

    const rawContactPerson = (body.contactPerson || "").trim();
    if (rawContactPerson.length < 2 || rawContactPerson.length > 60) {
      return NextResponse.json(
        { success: false, error: "Please enter the contact person's name (between 2 and 60 characters)." },
        { status: 400 }
      );
    }

    const cleanPhone = (body.phone || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const rawCity = (body.city || "").trim();
    if (rawCity.length < 2 || rawCity.length > 50) {
      return NextResponse.json(
        { success: false, error: "Please enter your city / town (between 2 and 50 characters)." },
        { status: 400 }
      );
    }

    const rawQuantity = (body.quantityNeeded || "").trim();
    if (rawQuantity.length < 1 || rawQuantity.length > 50) {
      return NextResponse.json(
        { success: false, error: "Please enter the estimated quantity needed (e.g. 50 jars, 100 kg)." },
        { status: 400 }
      );
    }

    const rawMessage = (body.message || "").trim();
    if (rawMessage.length < 5 || rawMessage.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Please provide inquiry details (between 5 and 1000 characters)." },
        { status: 400 }
      );
    }

    const newInquiry: WholesaleInquiry = {
      id: `inq_${crypto.randomUUID()}`,
      businessName: escapeAndTrim(rawBusinessName),
      contactPerson: escapeAndTrim(rawContactPerson),
      phone: cleanPhone,
      city: escapeAndTrim(rawCity),
      quantityNeeded: escapeAndTrim(rawQuantity),
      message: escapeAndTrim(rawMessage),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error: insertErr } = await supabase.from("wholesale_inquiries").insert([
        {
          id: newInquiry.id,
          business_name: newInquiry.businessName,
          contact_person: newInquiry.contactPerson,
          phone: newInquiry.phone,
          city: newInquiry.city,
          quantity_needed: newInquiry.quantityNeeded,
          message: newInquiry.message,
          created_at: newInquiry.createdAt,
        },
      ]);

      if (insertErr) {
        console.error("Supabase wholesale inquiry insert error:", insertErr);
        return NextResponse.json(
          { success: false, error: "Failed to record inquiry. Please try again." },
          { status: 500 }
        );
      }
    }

    if (process.env.NODE_ENV !== "production") {
      addLocalWholesaleInquiry(newInquiry);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your wholesale inquiry. Our team will review your requirements and get in touch shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Wholesale POST error:", error);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
