/**
 * M-Pesa Daraja STK Push initiation.
 * Requires: MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE,
 * MPESA_PASSKEY, MPESA_CALLBACK_URL, MPESA_ENV=sandbox|production
 */
import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/money";

const ENV = process.env.MPESA_ENV === "production" ? "production" : "sandbox";
const BASE =
  ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("M-Pesa credentials not configured");

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `${BASE}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  if (!res.ok) throw new Error(`M-Pesa OAuth failed: ${res.status}`);
  const data = (await res.json()) as {
    access_token: string;
    expires_in: string;
  };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in) * 1000,
  };
  return cachedToken.token;
}

function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

function password(shortcode: string, passkey: string, ts: string): string {
  return Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
}

export async function initiateStkPush(opts: {
  invoiceId: string;
  amount: number;
  phone: string; // 2547...
  accountReference?: string;
  createdById?: string;
}) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callback = process.env.MPESA_CALLBACK_URL;
  if (!shortcode || !passkey || !callback) {
    throw new Error("M-Pesa STK env not configured");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: opts.invoiceId },
  });
  if (!invoice) throw new Error("Invoice not found");

  const phone = opts.phone.replace(/\s+/g, "").replace(/^0/, "254");
  if (!/^254\d{9}$/.test(phone)) {
    throw new Error("Phone must be in format 2547XXXXXXXX");
  }

  const ts = timestamp();
  const token = await getAccessToken();
  const amount = Math.round(opts.amount);

  const body = {
    BusinessShortCode: shortcode,
    Password: password(shortcode, passkey, ts),
    Timestamp: ts,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callback,
    AccountReference: (opts.accountReference || opts.invoiceId).slice(0, 12),
    TransactionDesc: "School fees",
  };

  const res = await fetch(`${BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    ResponseCode?: string;
    ResponseDescription?: string;
    errorMessage?: string;
  };

  if (!res.ok || !data.CheckoutRequestID) {
    throw new Error(
      data.errorMessage || data.ResponseDescription || "STK push failed"
    );
  }

  // Create PENDING payment matched by checkoutRequestId for idempotent callback
  const payment = await prisma.payment.create({
    data: {
      invoiceId: opts.invoiceId,
      amount: toDecimal(amount),
      method: "mpesa_stk",
      status: "PENDING",
      checkoutRequestId: data.CheckoutRequestID,
      createdById: opts.createdById,
    },
  });

  return {
    paymentId: payment.id,
    checkoutRequestId: data.CheckoutRequestID,
    merchantRequestId: data.MerchantRequestID,
  };
}
