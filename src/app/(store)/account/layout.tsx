import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/store/account-nav";
import { SignOutButton } from "@/components/store/sign-out-button";
import { getReviewPromptsForUser } from "@/lib/catalog";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pt-32">
        {children}
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const reviewPrompts = await getReviewPromptsForUser(user.id);
  const awaitingReview = reviewPrompts.filter((p) => !p.existingReview).length;

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 pb-[max(3rem,env(safe-area-inset-bottom))] pt-20 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pt-32">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/50 pb-4 sm:mb-6 sm:items-end sm:gap-4 sm:pb-6 lg:mb-8 lg:pb-8">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber sm:text-xs">
            Your space
          </p>
          <p className="mt-1 break-words font-display text-2xl leading-tight sm:mt-2 sm:text-4xl">
            {profile?.full_name?.trim() || "Welcome back"}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:mt-1 sm:text-sm">
            {user.email}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
          {profile?.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex min-h-9 items-center px-1 text-[11px] uppercase tracking-[0.14em] text-amber hover:underline sm:min-h-11 sm:px-2 sm:text-xs sm:tracking-[0.16em]"
            >
              Admin
            </Link>
          ) : null}
          <SignOutButton />
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 border-b border-border/40 pb-4 lg:sticky lg:top-28 lg:self-start lg:border-b-0 lg:pb-0">
          <AccountNav reviewBadge={awaitingReview} />
        </aside>
        <div className="min-w-0 overflow-x-clip">{children}</div>
      </div>
    </div>
  );
}
