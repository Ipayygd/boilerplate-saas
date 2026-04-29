const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;
const XENDIT_WEBHOOK_TOKEN = process.env.XENDIT_WEBHOOK_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

interface XenditInvoice {
  id: string;
  external_id: string;
  invoice_url: string;
  status: string;
  amount: number;
}

export async function createInvoice(
  params: CreateInvoiceParams
): Promise<XenditInvoice> {
  const {
    externalId,
    amount,
    payerEmail,
    description,
    successRedirectUrl = `${APP_URL}/dashboard`,
    failureRedirectUrl = `${APP_URL}/dashboard`,
  } = params;

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64")}`,
    },
    body: JSON.stringify({
      external_id: externalId,
      amount,
      payer_email: payerEmail,
      description,
      success_redirect_url: successRedirectUrl,
      failure_redirect_url: failureRedirectUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create Xendit invoice");
  }

  return response.json();
}

export function verifyWebhookToken(token: string): boolean {
  return token === XENDIT_WEBHOOK_TOKEN;
}
