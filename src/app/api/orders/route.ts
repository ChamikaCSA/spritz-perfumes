import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders/create-order";
import { checkoutSchema } from "@/lib/orders/schema";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = checkoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout data" }, { status: 400 });
  }

  const result = await createOrder(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.demo) {
    return NextResponse.json({
      demo: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
    });
  }

  if (result.paymentSkipped) {
    return NextResponse.json({
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      total: result.total,
      paymentSkipped: true,
    });
  }

  return NextResponse.json({
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    payment: result.payment,
  });
}
