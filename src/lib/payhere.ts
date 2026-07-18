import { createHash } from "crypto";

export function isPayHereSandbox() {
  return process.env.PAYHERE_SANDBOX !== "false";
}

export function getPayHereMerchantId() {
  return process.env.PAYHERE_MERCHANT_ID ?? "";
}

export function generatePayHereHash(params: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  merchantSecret: string;
}) {
  const hashedSecret = createHash("md5")
    .update(params.merchantSecret)
    .digest("hex")
    .toUpperCase();

  const amountFormatted = Number(params.amount).toFixed(2);

  return createHash("md5")
    .update(
      params.merchantId +
        params.orderId +
        amountFormatted +
        params.currency +
        hashedSecret,
    )
    .digest("hex")
    .toUpperCase();
}

export function verifyPayHereNotify(params: {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  md5sig: string;
  merchantSecret: string;
}) {
  const hashedSecret = createHash("md5")
    .update(params.merchantSecret)
    .digest("hex")
    .toUpperCase();

  const localSig = createHash("md5")
    .update(
      params.merchantId +
        params.orderId +
        params.amount +
        params.currency +
        params.statusCode +
        hashedSecret,
    )
    .digest("hex")
    .toUpperCase();

  return localSig === params.md5sig.toUpperCase();
}

export type PayHerePaymentPayload = {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};
