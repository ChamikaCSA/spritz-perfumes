import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      addresses: [],
      email: "",
      phone: "",
      full_name: "",
    });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({
      addresses: [],
      email: "",
      phone: "",
      full_name: "",
    });
  }

  const [{ data: addresses }, { data: profile }] = await Promise.all([
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false }),
    supabase
      .from("profiles")
      .select("email, full_name, phone")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    addresses: addresses ?? [],
    email: profile?.email || user.email || "",
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
  });
}
