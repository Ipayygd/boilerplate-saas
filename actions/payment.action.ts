"use server";

import { createClient } from "@/lib/supabase/server";
import {
  createPayment as bayarGGCreatePayment,
  checkPayment,
} from "@/lib/bayargg";
import type { PaymentMethod } from "@/lib/bayargg";
import { getCurrentUser } from "@/services/user.service";

export { checkPayment };

interface CreatePaymentParams {
  amount: number;
  description: string;
  paymentMethod?: PaymentMethod;
  customerPhone?: string;
}

type CreatePaymentResult =
  | { data: { payment_url: string; invoice_id: string }; error: null }
  | { data: null; error: string };

/**
 * Membuat invoice pembayaran via bayar.gg dan menyimpannya ke database.
 *
 * @param params - Objek parameter pembayaran
 * @param params.amount - Nominal dalam Rupiah (contoh: 100000)
 * @param params.description - Deskripsi item yang dibeli
 * @param params.paymentMethod - Metode pembayaran ('qris', 'ovo', dll). Default: 'qris'
 * @param params.customerPhone - (Opsional) Nomor HP pelanggan untuk info WA
 *
 * @returns Object berisi payment_url dan invoice_id jika sukses, atau error jika gagal.
 */
export async function createPayment({
  amount,
  description,
  paymentMethod = "qris",
  customerPhone,
}: CreatePaymentParams): Promise<CreatePaymentResult> {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Unauthorized" };

  try {
    // 1. Panggil Library Bayar.gg
    const result = await bayarGGCreatePayment({
      amount,
      description,
      customerEmail: user.email!,
      paymentMethod,
      customerPhone,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/bayargg/webhook`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    });

    // 2. Ambil data dari result.data (sesuai struktur API)
    const paymentData = result.data;

    if (!paymentData || !paymentData.invoice_id) {
      throw new Error("Data pembayaran tidak valid dari provider");
    }

    // 3. Simpan ke Database Supabase
    const supabase = await createClient();

    const { error: dbError } = await supabase.from("payments").insert({
      user_id: user.id,
      bayargg_invoice_id: paymentData.invoice_id,
      amount: paymentData.amount,
      final_amount: paymentData.final_amount,
      unique_code: paymentData.unique_code,
      description,
      payment_method: paymentMethod,
      status: "PENDING",
      payment_url: paymentData.payment_url,
    });

    if (dbError) {
      console.error(
        "Database Action [createPayment] tabel [payments] tabel Error:",
        dbError,
      );
      throw new Error(dbError.message);
    }

    // 4. Return data ke frontend untuk redirect
    return {
      data: {
        payment_url: paymentData.payment_url,
        invoice_id: paymentData.invoice_id,
      },
      error: null,
    };
  } catch (err) {
    console.error("Action Error:", err);
    const message =
      err instanceof Error ? err.message : "Gagal membuat pembayaran";
    return { data: null, error: message };
  }
}
