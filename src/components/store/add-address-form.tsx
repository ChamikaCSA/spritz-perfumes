"use client";

import { useState } from "react";
import { createAddress } from "@/actions/store";
import {
  accountButtonClass,
  accountFieldClass,
  accountGhostButtonClass,
} from "@/components/store/account-shell";
import { LK_DISTRICTS } from "@/lib/utils-commerce";

export function AddAddressForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={accountGhostButtonClass}
      >
        Add address
      </button>
    );
  }

  return (
    <form action={createAddress} className="space-y-3">
      <input
        name="label"
        placeholder="Label"
        defaultValue="Home"
        className={accountFieldClass}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="first_name"
          required
          placeholder="First name"
          className={accountFieldClass}
        />
        <input
          name="last_name"
          required
          placeholder="Last name"
          className={accountFieldClass}
        />
      </div>
      <input
        name="phone"
        required
        placeholder="Phone"
        className={accountFieldClass}
      />
      <input
        name="address_line1"
        required
        placeholder="Address"
        className={accountFieldClass}
      />
      <input
        name="address_line2"
        placeholder="Address line 2"
        className={accountFieldClass}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="city"
          required
          placeholder="City"
          className={accountFieldClass}
        />
        <select
          name="district"
          required
          className={accountFieldClass}
          defaultValue={LK_DISTRICTS[0]}
        >
          {LK_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <input
        name="postal_code"
        placeholder="Postal code"
        className={accountFieldClass}
      />
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="is_default" value="1" />
        Set as default address
      </label>
      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
        <button type="submit" className={accountButtonClass}>
          Save address
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`${accountGhostButtonClass} flex-1 sm:flex-none`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
