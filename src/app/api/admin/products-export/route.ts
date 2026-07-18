import { createServiceClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { NextResponse } from "next/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("products")
      .select("*, brands(slug), notes")
      .order("name");
    if (error) throw new Error(error.message);

    const header =
      "brand_slug,name,slug,concentration,description,collection,notes_top,notes_heart,notes_base,is_active";
    const rows = (data ?? []).map((p) => {
      const brand = p.brands as { slug: string } | null;
      const notes = (p.notes ?? { top: [], heart: [], base: [] }) as {
        top: string[];
        heart: string[];
        base: string[];
      };
      return [
        brand?.slug ?? "",
        p.name,
        p.slug,
        p.concentration,
        JSON.stringify(p.description ?? ""),
        p.collection ?? "core",
        (notes.top ?? []).join("|"),
        (notes.heart ?? []).join("|"),
        (notes.base ?? []).join("|"),
        p.is_active ? "true" : "false",
      ].join(",");
    });

    return new NextResponse([header, ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="products.csv"',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Export failed" },
      { status: 500 },
    );
  }
}
