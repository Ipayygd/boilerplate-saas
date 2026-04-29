import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyWebhookToken } from "@/lib/xendit";

export async function POST(request: NextRequest) {
  // Verifikasi webhook token dari header Xendit
  const webhookToken = request.headers.get("x-callback-token");

  if (!webhookToken || !verifyWebhookToken(webhookToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { external_id, status } = body;

  if (!external_id || !status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("payments")
    .update({
      status: status === "PAID" ? "PAID" : status === "EXPIRED" ? "EXPIRED" : "FAILED",
      updated_at: new Date().toISOString(),
    })
    .eq("external_id", external_id);

  if (error) {
    console.error("Webhook DB error:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
