import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, type WebhookPayload } from "@/lib/bayargg";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json(
      { error: "Missing webhook signature or timestamp" },
      { status: 401 }
    );
  }

  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Verifikasi signature menggunakan HMAC SHA256
  const isValid = await verifyWebhookSignature(payload, signature, timestamp);
  if (!isValid) {
    console.error("Invalid webhook signature from bayar.gg");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoice_id, status } = payload;

  if (!invoice_id || !status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Map status bayar.gg ke status internal
  const mappedStatus =
    status === "paid"
      ? "PAID"
      : status === "expired"
        ? "EXPIRED"
        : status === "cancelled"
          ? "FAILED"
          : "FAILED";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("payments")
    .update({
      status: mappedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("bayargg_invoice_id", invoice_id);

  if (error) {
    console.error("Webhook DB error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}