import { createClient } from "@/lib/supabase/server";

export async function getPaymentByInvoiceId(invoiceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("bayargg_invoice_id", invoiceId)
    .single();

  if (error) return null;
  return data;
}
