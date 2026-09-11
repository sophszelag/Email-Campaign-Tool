import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client. Uses the service role key, so it must
// never be imported from a Client Component or exposed to the browser.
// Every caller of this file is a Server Component, Server Action, or
// Route Handler that has already checked the NextAuth session.
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
