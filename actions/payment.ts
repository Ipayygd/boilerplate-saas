"use server";

import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/lib/xendit";
import { generateId } from "@/utils";
import { getUser } from "./auth";

interface CreatePaymentParams {
  amount: number;
  description: string;
}

type CreatePaymentResult =
  | { data: { invoice_url: string; id: string }; error: null }
  | { data: null; error: string };

export async function createPayment({ amount, description }: CreatePaymentParams): Promise<CreatePaymentResult> {
  const user = await getUser();
  if (!user) return { data: null, error: "Unauthorized" };

  const externalId = generateId("inv");

  try {
    const invoice = await createInvoice({
      externalId,
      amount,
      payerEmail: user.email!,
      description,
      successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?external_id=${externalId}`,
      failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?external_id=${externalId}`,
    });

    const supabase = await createClient();
    const { error: dbError } = await supabase.from("payments").insert({
      user_id: user.id,
      external_id: externalId,
      amount,
      description,
      status: "PENDING",
      invoice_url: invoice.invoice_url,
      xendit_invoice_id: invoice.id,
    });

    if (dbError) throw new Error(dbError.message);

    return { data: invoice, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal membuat pembayaran";
    return { data: null, error: message };
  }
}

export async function getPaymentByExternalId(externalId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("external_id", externalId)
    .single();

  if (error) return null;
  return data;
}
