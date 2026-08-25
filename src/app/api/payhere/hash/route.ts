import { NextResponse } from "next/server";
import { z } from "zod";
import { generatePayHereHash, getPayHereMerchantId } from "@/lib/payments/payhere";

const schema = z.object({
  orderId: z.string().min(1),
  amount: z.string().min(1),
  currency: z.string().default("LKR"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const merchantId = getPayHereMerchantId();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantId || !merchantSecret) {
    return NextResponse.json(
      { error: "PayHere is not configured" },
      { status: 500 },
    );
  }

  const hash = generatePayHereHash({
    merchantId,
    orderId: parsed.data.orderId,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
    merchantSecret,
  });

  return NextResponse.json({ hash, merchant_id: merchantId });
}
