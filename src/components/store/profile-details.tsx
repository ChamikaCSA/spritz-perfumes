"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/actions/store";
import {
  accountButtonClass,
  accountFieldClass,
  accountGhostButtonClass,
} from "@/components/store/account-shell";
import { cn } from "@/lib/utils";

export function ProfileDetails({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const fields = (
    <div
      className={cn(
        "grid min-w-0 flex-1 gap-3 text-sm sm:gap-5",
        editing ? "sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
      )}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
          Name
        </p>
        {editing ? (
          <input
            name="full_name"
            defaultValue={fullName}
            placeholder="Full name"
            className={`${accountFieldClass} mt-1.5`}
          />
        ) : (
          <p className="mt-1 sm:mt-1.5">{fullName || "—"}</p>
        )}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
          Phone
        </p>
        {editing ? (
          <input
            name="phone"
            defaultValue={phone}
            placeholder="Phone"
            className={`${accountFieldClass} mt-1.5`}
          />
        ) : (
          <p className="mt-1 sm:mt-1.5">{phone || "—"}</p>
        )}
      </div>
      {!editing ? (
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
            Email
          </p>
          <p className="mt-1 break-all sm:mt-1.5">{email || "—"}</p>
        </div>
      ) : null}
    </div>
  );

  const actions = editing ? (
    <div className="flex w-full shrink-0 gap-2 sm:w-auto">
      <button
        type="submit"
        disabled={pending}
        className={accountButtonClass}
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className={`${accountGhostButtonClass} flex-1 sm:flex-none`}
      >
        Cancel
      </button>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`${accountGhostButtonClass} w-full sm:w-auto`}
    >
      Edit
    </button>
  );

  if (!editing) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        {fields}
        {actions}
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5"
      action={(fd) => {
        startTransition(async () => {
          try {
            await updateProfile(fd);
            toast.success("Profile saved");
            setEditing(false);
            router.refresh();
          } catch {
            toast.error("Could not save profile");
          }
        });
      }}
    >
      {fields}
      {actions}
    </form>
  );
}
