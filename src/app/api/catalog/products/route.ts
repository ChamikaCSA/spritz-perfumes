import { NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/catalog";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const ids = new URL(request.url).searchParams.get("ids") ?? "";
  const parsed = ids
    .split(",")
    .map((id) => id.trim())
    .filter((id) => UUID_RE.test(id))
    .slice(0, 100);

  const products = await getProductsByIds(parsed);
  return NextResponse.json({ products });
}
