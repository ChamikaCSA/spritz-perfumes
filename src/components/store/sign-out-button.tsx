"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="inline-flex min-h-9 items-center px-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground hover:text-amber sm:min-h-11 sm:tracking-[0.18em] sm:text-xs"
    >
      Sign out
    </button>
  );
}
