import { NextResponse, type NextRequest } from "next/server";
import {
  isSupabaseConfigured,
  supabase,
  createSupabaseReqClient,
} from "@/lib/supabase-server";
import { getLocalOrders, normalizeOrderRow } from "@/lib/store";



export async function GET(request: NextRequest) {
  try {
    // 1. Verify the Supabase session strictly from the request cookies
    const authClient = createSupabaseReqClient(request);
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access. Please sign in to view your personal orders.",
        },
        { status: 401 }
      );
    }

    const userId = user.id;
    const userEmail = (user.email || "").toLowerCase().trim();
    let ordersList: any[] = [];

    // 2. Fetch from Supabase
    if (isSupabaseConfigured && supabase) {
      // Primary: filter by user_id
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        ordersList = data.map(normalizeOrderRow);
      } else if (error) {
        console.warn("Supabase user_id orders lookup error, checking email fallback:", error.message);
        // Fallback: If user_id column is not yet migrated, filter by customer email
        if (userEmail) {
          const { data: fallbackData } = await supabase
            .from("orders")
            .select("*")
            .eq("email", userEmail)
            .order("created_at", { ascending: false });

          if (fallbackData) {
            ordersList = fallbackData.map(normalizeOrderRow);
          }
        }
      }
    }

    // 3. Development local store fallback
    if (process.env.NODE_ENV !== "production") {
      const local = getLocalOrders().filter((o: any) => {
        const matchesUser = o.userId === userId;
        const matchesEmail = userEmail && o.email?.toLowerCase().trim() === userEmail;
        return matchesUser || matchesEmail;
      });

      // Merge and deduplicate by id
      const orderMap = new Map<string, any>();
      for (const ord of [...ordersList, ...local]) {
        if (ord.id && !orderMap.has(ord.id)) {
          orderMap.set(ord.id, ord);
        }
      }
      ordersList = Array.from(orderMap.values());
    }

    return NextResponse.json({
      success: true,
      orders: ordersList,
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      (err as any).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw err;
    }
    console.error("Account orders route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve account orders. Please try again.",
      },
      { status: 500 }
    );
  }
}
