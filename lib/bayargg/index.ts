const BAYARGG_API_KEY = process.env.BAYARGG_API_KEY!;
const BAYARGG_WEBHOOK_SECRET = process.env.BAYARGG_WEBHOOK_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const BASE_URL = "https://www.bayar.gg/api";

export type PaymentMethod = "qris" | "qris_user" | "gopay_qris" | "ovo";

interface CreatePaymentParams {
  amount: number;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentMethod?: PaymentMethod;
  callbackUrl?: string;
  redirectUrl?: string;
}

// Interface sesuai struktur JSON response API Bayar.gg
export interface BayarGGPaymentData {
  invoice_id: string;
  amount: number;
  unique_code: number;
  final_amount: number;
  payment_method: string;
  status: string;
  expires_at: string;
  payment_url: string;
  redirect_url?: string;
  qris_string?: string;
  qris_static_string?: string;
  qris_static_image_url?: string;
  iqris_invoiceid?: string;
  iqris_nmid?: string;
  iqris_request_date?: string;
  qris_dynamic_string?: string;
  qris_dynamic_image_url?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  data: BayarGGPaymentData;
}

export interface CheckPaymentResponse {
  success: boolean;
  invoice_id: string;
  status: "pending" | "paid" | "expired" | "cancelled";
  amount: number;
  final_amount: number;
  payment_method: string;
  paid_at?: string;
  paid_reff_num?: string;
  expires_at: string;
}

export interface WebhookPayload {
  event: string;
  invoice_id: string;
  status: string;
  amount: number;
  final_amount: number;
  unique_code: number;
  paid_at: string;
  paid_amount: number;
  paid_reff_num: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  description?: string;
  redirect_url?: string;
  timestamp: number;
  signature: string;
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "X-API-Key": BAYARGG_API_KEY,
  };
}

export async function createPayment(
  params: CreatePaymentParams,
): Promise<CreatePaymentResponse> {
  const {
    amount,
    description,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod = "qris",
    callbackUrl = `${APP_URL}/api/bayargg/webhook`,
    redirectUrl = `${APP_URL}/payment/success`,
  } = params;

  if (!BAYARGG_API_KEY) {
    throw new Error("BAYARGG_API_KEY tidak ditemukan di environment variables");
  }

  const response = await fetch(`${BASE_URL}/create-payment.php`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      amount,
      description,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      payment_method: paymentMethod,
      callback_url: callbackUrl,
      redirect_url: redirectUrl,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "Gagal membuat pembayaran");
  }

  // Validasi struktur data
  if (!data.data || !data.data.invoice_id) {
    console.error("Struktur data API tidak valid:", data);
    throw new Error("Respons API tidak valid: Data invoice kosong");
  }

  return data as CreatePaymentResponse;
}

export async function checkPayment(
  invoiceId: string,
): Promise<CheckPaymentResponse> {
  const response = await fetch(
    `${BASE_URL}/check-payment.php?invoice=${encodeURIComponent(invoiceId)}`,
    {
      headers: getHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || data.error || "Gagal mengecek status pembayaran",
    );
  }

  return data as CheckPaymentResponse;
}

/**
 * Verifikasi signature webhook dari bayar.gg
 * Format: HMAC SHA256 dari: invoice_id|status|final_amount|timestamp
 */
export async function verifyWebhookSignature(
  payload: WebhookPayload,
  signature: string,
  timestamp: string,
): Promise<boolean> {
  const signatureData = `${payload.invoice_id}|${payload.status}|${payload.final_amount}|${timestamp}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(BAYARGG_WEBHOOK_SECRET);
  const messageData = encoder.encode(signatureData);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageData,
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSignature === signature;
}
