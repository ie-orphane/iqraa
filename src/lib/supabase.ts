import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import env from "@/env";

let client: SupabaseClient | undefined;

export function getSupabaseAdmin() {
  if (client) return client;

  client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
