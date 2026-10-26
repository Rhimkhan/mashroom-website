import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, escapeAndTrim } from "@/lib/rate-limit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate limiting on contact submissions (max 5 contact messages per hour per IP)
    const rateLimit = checkRateLimit(`contact_submit:${ip}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Message limit reached (maximum 5 contact messages per hour per IP). Please try again later.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 2. Hidden honeypot field check (rejects bots)
    if (body.website_url || body.honeypot || body.business_fax) {
      console.warn(`[SECURITY] Contact honeypot triggered from IP ${ip}`);
      return NextResponse.json(
        { success: false, error: "Bot activity detected. Submission rejected." },
        { status: 400 }
      );
    }

    // 3. Server-side validation
    // Name: 2 to 60 characters
    const rawName = (body.name || "").trim();
    if (rawName.length < 2 || rawName.length > 60) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (between 2 and 60 characters)." },
        { status: 400 }
      );
    }
    const name = escapeAndTrim(rawName);

    // Phone: exactly 10 digits starting with 6 to 9
    const cleanPhone = (body.phone || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9." },
        { status: 400 }
      );
    }

    // Message: 10 to 2000 characters
    const rawMessage = (body.message || "").trim();
    if (rawMessage.length < 10 || rawMessage.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Please enter a message between 10 and 2000 characters." },
        { status: 400 }
      );
    }
    const message = escapeAndTrim(rawMessage);

    // Email format validation (optional, but if provided must be valid)
    const rawEmail = (body.email || "").trim();
    if (rawEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (rawEmail.length > 100 || !emailRegex.test(rawEmail)) {
        return NextResponse.json(
          { success: false, error: "Please enter a valid email address (e.g. yourname@example.com)." },
          { status: 400 }
        );
      }
    }
    const email = rawEmail ? escapeAndTrim(rawEmail) : "";
    const subject = escapeAndTrim(body.subject || "Inquiry").slice(0, 100);

    // Persist to Supabase if configured (strictly server-side with service role)
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("contact_messages").insert([
          {
            name,
            phone: cleanPhone,
            email: email || null,
            subject,
            message,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn("Supabase contact_messages insert error:", err);
      }
    }

    console.log(`[CONTACT RECEIVED] From: ${name} (${cleanPhone}) | Email: ${email || "N/A"} | Subject: ${subject}`);

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Our Jhansi kitchen concierge has received your message and will respond shortly.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while sending your message." },
      { status: 500 }
    );
  }
}
