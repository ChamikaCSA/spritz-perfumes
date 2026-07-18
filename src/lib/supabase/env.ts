export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

/** Browser / RLS-scoped client key. */
export function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
}

/** Server admin key that bypasses RLS. */
export function getSupabaseSecretKey() {
  return process.env.SUPABASE_SECRET_KEY ?? "";
}

export function isSupabaseConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  return Boolean(url && key && !url.includes("your-project"));
}
