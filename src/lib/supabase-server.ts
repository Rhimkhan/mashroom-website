import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// SUPABASE_SERVICE_ROLE_KEY is strictly server-side and never exposed to client code
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isServiceRoleValid = Boolean(
  serviceRoleKey &&
  !serviceRoleKey.includes("<") &&
  !serviceRoleKey.includes(">") &&
  !serviceRoleKey.includes("your-service-role-key") &&
  !serviceRoleKey.includes("copied from") &&
  serviceRoleKey.trim() !== "" &&
  (serviceRoleKey.startsWith("eyJ") || serviceRoleKey.startsWith("sb_secret_"))
);

const effectiveKey: string =
  (isServiceRoleValid && serviceRoleKey ? serviceRoleKey : anonKey) || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  effectiveKey &&
  supabaseUrl !== "https://your-project.supabase.co" &&
  supabaseUrl.trim() !== ""
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, effectiveKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Creates an SSR Supabase client from NextRequest cookies
 * Used to verify customer sessions on the server without trusting client input
 */
export function createSupabaseReqClient(request: NextRequest) {
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });
}

/**
 * Creates an SSR Supabase client using next/headers cookies
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored if called during static generation or component render
        }
      },
    },
  });
}
