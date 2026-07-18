import { redirect } from "next/navigation";
import { deleteAddress, updateAddress } from "@/actions/store";
import { AddAddressForm } from "@/components/store/add-address-form";
import { ProfileDetails } from "@/components/store/profile-details";
import {
  AccountEmpty,
  AccountPageHeader,
  AccountPanel,
  accountGhostButtonClass,
} from "@/components/store/account-shell";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils-commerce";

export const metadata = { title: "Profile · Account" };

export default async function AccountProfilePage() {
  if (!isSupabaseConfigured()) redirect("/account");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/profile");

  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false }),
  ]);

  const list = addresses ?? [];

  return (
    <div className="space-y-5 sm:space-y-8">
      <AccountPageHeader
        title="Profile"
        description="Your details and delivery addresses."
      />

      <AccountPanel
        title="Details"
        description="How we greet you and reach you about orders."
      >
        <ProfileDetails
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
          email={user.email ?? ""}
        />
      </AccountPanel>

      <div id="addresses" className="scroll-mt-24 sm:scroll-mt-28">
        <AccountPanel
          title="Addresses"
          description="Saved for faster checkout."
        >
          {list.length === 0 ? (
            <AccountEmpty>No saved addresses yet.</AccountEmpty>
          ) : (
            <ul className="space-y-2.5 sm:space-y-3">
              {list.map((a) => (
                <li
                  key={a.id}
                  className="border border-border/60 bg-background/40 p-4 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                    <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-3 sm:gap-5">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <p className="font-display text-xl sm:text-2xl">
                            {a.label}
                          </p>
                          {a.is_default ? (
                            <span className="text-[10px] uppercase tracking-[0.16em] text-amber">
                              Default
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 sm:text-[11px]">
                          Contact
                        </p>
                        <p className="mt-1 text-foreground sm:mt-1.5">
                          {a.first_name} {a.last_name}
                        </p>
                        <p className="mt-0.5">{a.phone}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 sm:text-[11px]">
                          Deliver to
                        </p>
                        <p className="mt-1 text-foreground sm:mt-1.5">
                          {a.address_line1}
                          {a.address_line2 ? `, ${a.address_line2}` : ""}
                        </p>
                        <p className="mt-0.5">
                          {a.city}, {a.district}
                          {a.postal_code ? ` ${a.postal_code}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2 sm:justify-end">
                      {!a.is_default ? (
                        <form action={updateAddress} className="flex-1 sm:flex-none">
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="label" value={a.label} />
                          <input
                            type="hidden"
                            name="first_name"
                            value={a.first_name}
                          />
                          <input
                            type="hidden"
                            name="last_name"
                            value={a.last_name}
                          />
                          <input type="hidden" name="phone" value={a.phone} />
                          <input
                            type="hidden"
                            name="address_line1"
                            value={a.address_line1}
                          />
                          <input
                            type="hidden"
                            name="address_line2"
                            value={a.address_line2 ?? ""}
                          />
                          <input type="hidden" name="city" value={a.city} />
                          <input
                            type="hidden"
                            name="district"
                            value={a.district}
                          />
                          <input
                            type="hidden"
                            name="postal_code"
                            value={a.postal_code ?? ""}
                          />
                          <input type="hidden" name="is_default" value="1" />
                          <button
                            type="submit"
                            className={`${accountGhostButtonClass} w-full sm:w-auto`}
                          >
                            Make default
                          </button>
                        </form>
                      ) : null}
                      <form action={deleteAddress} className="flex-1 sm:flex-none">
                        <input type="hidden" name="id" value={a.id} />
                        <button
                          type="submit"
                          className={`${accountGhostButtonClass} w-full sm:w-auto`}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div
            className={
              list.length === 0
                ? "mt-4 sm:mt-6"
                : "mt-5 border-t border-border/50 pt-5 sm:mt-8 sm:pt-6"
            }
          >
            <AddAddressForm />
          </div>
        </AccountPanel>
      </div>
    </div>
  );
}
