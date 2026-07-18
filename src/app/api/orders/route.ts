import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import {
  generatePayHereHash,
  getPayHereMerchantId,
  isPayHereSandbox,
} from "@/lib/payhere";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  generateOrderNumber,
  isSupabaseConfigured,
  SHIPPING_LKR,
} from "@/lib/utils-commerce";

const bodySchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(8),
  address_line1: z.string().min(3),
  address_line2: z.string().nullable().optional(),
  city: z.string().min(1),
  district: z.string().min(1),
  postal_code: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
  }

  const input = parsed.data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Resolve line items from demo or DB
  const lineItems: {
    variant_id: string;
    product_name: string;
    brand_name: string;
    variant_type: "full_size" | "decant";
    size_ml: number;
    sku: string;
    quantity: number;
    unit_price_lkr: number;
    line_total_lkr: number;
  }[] = [];

  if (!isSupabaseConfigured()) {
    for (const item of input.items) {
      let found = false;
      for (const product of DEMO_PRODUCTS) {
        const variant = product.variants?.find((v) => v.id === item.variantId);
        if (variant) {
          lineItems.push({
            variant_id: variant.id,
            product_name: product.name,
            brand_name: product.brand?.name ?? "",
            variant_type: variant.type,
            size_ml: Number(variant.size_ml),
            sku: variant.sku,
            quantity: item.quantity,
            unit_price_lkr: Number(variant.price_lkr),
            line_total_lkr: Number(variant.price_lkr) * item.quantity,
          });
          found = true;
          break;
        }
      }
      if (!found) {
        return NextResponse.json({ error: "Unknown variant" }, { status: 400 });
      }
    }

    const subtotal = lineItems.reduce((s, i) => s + i.line_total_lkr, 0);
    const orderId = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    return NextResponse.json({
      demo: true,
      orderId,
      orderNumber,
      total: subtotal + SHIPPING_LKR,
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createServiceClient();
  const variantIds = input.items.map((i) => i.variantId);

  const { data: variants, error: variantsError } = await service
    .from("product_variants")
    .select("*, products(*, brands(*))")
    .in("id", variantIds)
    .eq("is_active", true);

  if (variantsError || !variants?.length) {
    return NextResponse.json({ error: "Could not load variants" }, { status: 400 });
  }

  for (const item of input.items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) {
      return NextResponse.json({ error: "Unknown variant" }, { status: 400 });
    }
    const product = variant.products as {
      name: string;
      brands: { name: string } | { name: string }[];
    };
    const brand = Array.isArray(product.brands)
      ? product.brands[0]
      : product.brands;

    lineItems.push({
      variant_id: variant.id,
      product_name: product.name,
      brand_name: brand?.name ?? "",
      variant_type: variant.type,
      size_ml: Number(variant.size_ml),
      sku: variant.sku,
      quantity: item.quantity,
      unit_price_lkr: Number(variant.price_lkr),
      line_total_lkr: Number(variant.price_lkr) * item.quantity,
    });
  }

  const subtotal = lineItems.reduce((s, i) => s + i.line_total_lkr, 0);
  const shipping = SHIPPING_LKR;
  const total = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await service
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user?.id ?? null,
      email: input.email,
      phone: input.phone,
      first_name: input.first_name,
      last_name: input.last_name,
      address_line1: input.address_line1,
      address_line2: input.address_line2 ?? null,
      city: input.city,
      district: input.district,
      postal_code: input.postal_code ?? null,
      status: "pending_payment",
      subtotal_lkr: subtotal,
      shipping_lkr: shipping,
      total_lkr: total,
    })
    .select("*")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 },
    );
  }

  const { error: itemsError } = await service.from("order_items").insert(
    lineItems.map((item) => ({
      order_id: order.id,
      ...item,
    })),
  );

  if (itemsError) {
    await service.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const merchantId = getPayHereMerchantId();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET ?? "";
  const amount = total.toFixed(2);
  const payhereOrderId = order.order_number;

  await service.from("payments").insert({
    order_id: order.id,
    payhere_order_id: payhereOrderId,
    status: "pending",
    amount_lkr: total,
    currency: "LKR",
  });

  if (!merchantId || !merchantSecret || merchantId.includes("your-merchant")) {
    // Order is saved; PayHere not configured yet
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      paymentSkipped: true,
    });
  }

  const hash = generatePayHereHash({
    merchantId,
    orderId: payhereOrderId,
    amount,
    currency: "LKR",
    merchantSecret,
  });

  const payment = {
    sandbox: isPayHereSandbox(),
    merchant_id: merchantId,
    return_url: `${siteUrl}/orders/${order.id}`,
    cancel_url: `${siteUrl}/checkout`,
    notify_url: `${siteUrl}/api/payhere/notify`,
    order_id: payhereOrderId,
    items: lineItems.map((i) => `${i.product_name} ${i.size_ml}ml`).join(", "),
    amount,
    currency: "LKR",
    hash,
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    phone: input.phone,
    address: input.address_line1,
    city: input.city,
    country: "Sri Lanka",
  };

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
    payment,
  });
}
