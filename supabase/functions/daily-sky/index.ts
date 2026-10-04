import { createClient } from "jsr:@supabase/supabase-js@2.116.0";
import { calculateDailySky } from "./astronomy.ts";
import { dailySkyHandler } from "./handler.ts";

// Read-only astronomy endpoint. No service-role key, database write, or natal data.
Deno.serve(dailySkyHandler(async (token) => {
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await client.auth.getUser(token);
  return !error && !!data.user;
}, calculateDailySky));
