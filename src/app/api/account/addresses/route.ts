import { NextResponse } from "next/server";
import { getCheckoutProfile } from "@/lib/account/queries";
import { getSessionUser, isDemoMode } from "@/lib/auth";

const empty = {
  addresses: [],
  email: "",
  phone: "",
  full_name: "",
};

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json(empty);
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json(empty);
  const profile = await getCheckoutProfile(user.id);
  return NextResponse.json({
    ...profile,
    email: profile.email || user.email || "",
  });
}
