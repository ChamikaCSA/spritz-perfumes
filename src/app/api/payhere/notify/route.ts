import { NextResponse } from "next/server";
import { verifyPayHereNotify } from "@/lib/payments/payhere";
import { createServiceClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { isDemoMode } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const merchantId = String(form.get("merchant_id") ?? "");
  const orderId = String(form.get("order_id") ?? "");
  const payherePaymentId = String(form.get("payment_id") ?? "");
  const statusCode = String(form.get("status_code") ?? "");
  const md5sig = String(form.get("md5sig") ?? "");
  const amount = String(form.get("payhere_amount") ?? "");
  const currency = String(form.get("payhere_currency") ?? "LKR");
  const method = String(form.get("method") ?? "");

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET ?? "";
  const valid = verifyPayHereNotify({
    merchantId,
    orderId,
    amount,
    currency,
    statusCode,
    md5sig,
    merchantSecret,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const service = createServiceClient();
  const raw = Object.fromEntries(
    [...form.entries()].map(([key, value]) => [key, String(value)]),
  ) as Json;

  const { data: payment } = await service
    .from("payments")
    .select("*, orders(*)")
    .eq("payhere_order_id", orderId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Idempotent: already success
  if (payment.status === "success") {
    return NextResponse.json({ ok: true });
  }

  if (statusCode === "2") {
    await service
      .from("payments")
      .update({
        status: "success",
        payhere_payment_id: payherePaymentId,
        method,
        raw_notify: raw,
      })
      .eq("id", payment.id);

    const order = payment.orders as { id: string; status: string };
    if (order.status === "pending_payment") {
      await service
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id);

      const { error: fulfillError } = await service.rpc(
        "fulfill_order_inventory",
        { p_order_id: order.id },
      );

      if (fulfillError) {
        console.error("Inventory fulfill failed", fulfillError);
      }
    }
  } else if (statusCode === "-1" || statusCode === "0") {
    await service
      .from("payments")
      .update({
        status: "failed",
        payhere_payment_id: payherePaymentId || null,
        method,
        raw_notify: raw,
      })
      .eq("id", payment.id);
  } else if (statusCode === "-2") {
    await service
      .from("payments")
      .update({
        status: "chargedback",
        raw_notify: raw,
      })
      .eq("id", payment.id);
  }

  return NextResponse.json({ ok: true });
}
