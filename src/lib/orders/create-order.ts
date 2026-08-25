import { z } from "zod";
import { DEMO_PRODUCTS } from "@/lib/catalog/demo";
import { generateOrderNumber, SHIPPING_LKR } from "@/lib/commerce";
import { isDemoMode } from "@/lib/data";
import {
  generatePayHereHash,
  getPayHereMerchantId,
  isPayHereSandbox,
  type PayHerePaymentPayload,
} from "@/lib/payments/payhere";
import { checkoutSchema } from "@/lib/orders/schema";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/seo";

export type CheckoutInput = z.infer<typeof checkoutSchema>;

type LineItem = {
  variant_id: string;
  product_name: string;
  brand_name: string;
  variant_type: "full_size" | "decant";
  size_ml: number;
  sku: string;
  quantity: number;
  unit_price_lkr: number;
  line_total_lkr: number;
};

export type CreateOrderResult =
  | { ok: false; error: string; status: number }
  | {
      ok: true;
      demo?: boolean;
      orderId: string;
      orderNumber: string;
      total: number;
      paymentSkipped?: boolean;
      payment?: PayHerePaymentPayload;
    };

function lineItemFromVariant(input: {
  variant: {
    id: string;
    type: string;
    size_ml: number;
    sku: string;
    price_lkr: number;
  };
  productName: string;
  brandName: string;
  quantity: number;
}): LineItem {
  const unit = Number(input.variant.price_lkr);
  return {
    variant_id: input.variant.id,
    product_name: input.productName,
    brand_name: input.brandName,
    variant_type: input.variant.type === "decant" ? "decant" : "full_size",
    size_ml: Number(input.variant.size_ml),
    sku: input.variant.sku,
    quantity: input.quantity,
    unit_price_lkr: unit,
    line_total_lkr: unit * input.quantity,
  };
}

function resolveDemoLineItems(input: CheckoutInput): LineItem[] | null {
  const lineItems: LineItem[] = [];
  for (const item of input.items) {
    let found = false;
    for (const product of DEMO_PRODUCTS) {
      const variant = product.variants?.find((v) => v.id === item.variantId);
      if (!variant) continue;
      lineItems.push(
        lineItemFromVariant({
          variant,
          productName: product.name,
          brandName: product.brand?.name ?? "",
          quantity: item.quantity,
        }),
      );
      found = true;
      break;
    }
    if (!found) return null;
  }
  return lineItems;
}

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  if (isDemoMode()) {
    const lineItems = resolveDemoLineItems(input);
    if (!lineItems) return { ok: false, error: "Unknown variant", status: 400 };
    const subtotal = lineItems.reduce((s, i) => s + i.line_total_lkr, 0);
    return {
      ok: true,
      demo: true,
      orderId: crypto.randomUUID(),
      orderNumber: generateOrderNumber(),
      total: subtotal + SHIPPING_LKR,
    };
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
    return { ok: false, error: "Could not load variants", status: 400 };
  }

  const lineItems: LineItem[] = [];
  for (const item of input.items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant) return { ok: false, error: "Unknown variant", status: 400 };
    const product = variant.products as {
      name: string;
      brands: { name: string } | { name: string }[];
    };
    const brand = Array.isArray(product.brands)
      ? product.brands[0]
      : product.brands;
    lineItems.push(
      lineItemFromVariant({
        variant,
        productName: product.name,
        brandName: brand?.name ?? "",
        quantity: item.quantity,
      }),
    );
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
    return {
      ok: false,
      error: orderError?.message ?? "Failed to create order",
      status: 500,
    };
  }

  const { error: itemsError } = await service.from("order_items").insert(
    lineItems.map((item) => ({ order_id: order.id, ...item })),
  );
  if (itemsError) {
    await service.from("orders").delete().eq("id", order.id);
    return { ok: false, error: itemsError.message, status: 500 };
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
    return {
      ok: true,
      orderId: order.id,
      orderNumber: order.order_number,
      total,
      paymentSkipped: true,
    };
  }

  const siteUrl = getSiteUrl();
  const hash = generatePayHereHash({
    merchantId,
    orderId: payhereOrderId,
    amount,
    currency: "LKR",
    merchantSecret,
  });

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    total,
    payment: {
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
    },
  };
}
