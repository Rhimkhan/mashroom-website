import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const isAuthenticated = verifyAdminSession(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { authenticated: false, error: "Unauthorized. Admin session required." },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  }
  return NextResponse.json(
    { authenticated: true },
    {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}
