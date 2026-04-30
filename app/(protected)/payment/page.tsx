"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/actions/payment";
import type { PaymentMethod } from "@/lib/bayargg";
import { formatIDR } from "@/utils";

export default function PaymentExamplePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CONTOH DATA PRODUK (Biasanya ini dari Props/Database)
  const PRODUCT = {
    id: "prod_123",
    name: "Undangan Digital Premium",
    price: 1000, // Dalam Rupiah
  };

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      // --- BAGIAN PENTING UNTUK DEVELOPER ---
      // Ini adalah parameter WAJIB yang harus dikirim ke Server Action

      const payload = {
        amount: PRODUCT.price, // 1. Nominal (Integer, bukan string)
        description: `Pembelian ${PRODUCT.name}`, // 2. Deskripsi transaksi
        paymentMethod: "qris" as PaymentMethod, // 3. Metode bayar (qris/ovo/dll)
        // customerPhone: "08123456789", // 4. Opsional: No HP user (untuk info WA)
      };

      // Panggil Server Action
      const result = await createPayment(payload);

      if (!result.data) {
        throw new Error(result.error || "Gagal membuat invoice");
      }

      // Redirect ke halaman pembayaran Bayar.gg
      console.log("✅ Redirect ke:", result.data.payment_url);
      router.push(result.data.payment_url);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold mb-4">Contoh Implementasi</h1>

        <div className="bg-gray-100 p-4 rounded mb-6 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Produk:</span>
            <span className="font-medium">{PRODUCT.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Harga:</span>
            <span className="font-bold text-black">
              {formatIDR(PRODUCT.price)}
            </span>
          </div>

          {/* Teks Petunjuk Developer */}
          <p className="text-xs text-blue-600 pt-2 border-t border-gray-200 mt-2 italic">
            💡 Tip: Buka <strong>Console Browser</strong> (F12) untuk melihat
            struktur data yang dikirim ke Server Action.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 transition-all"
        >
          {loading ? "Memproses..." : "Bayar Sekarang (Demo)"}
        </button>
      </div>
    </div>
  );
}
