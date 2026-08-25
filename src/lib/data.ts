import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/supabase/env";

export type ServerClient = SupabaseClient<Database>;

export { isDemoMode };

export async function liveOrDemo<T>(
  demo: () => T | Promise<T>,
  live: (sb: ServerClient) => Promise<T>,
): Promise<T> {
  if (isDemoMode()) return demo();
  const sb = await createClient();
  return live(sb);
}
