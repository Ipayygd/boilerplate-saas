"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/actions/payment";

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;

    const result = await createPayment({ amount, description });

    if (!result.data) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(result.data.invoice_url);
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-xl bg-white shadow-sm">
      <h1 className="text-xl font-semibold mb-1">Buat Pembayaran</h1>
      <p className="text-sm text-gray-500 mb-6">
        Isi detail pembayaran di bawah. Kamu akan diarahkan ke halaman Xendit
        untuk menyelesaikan transaksi.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium">
            Deskripsi
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            placeholder="Contoh: Pembelian Produk A"
            className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Jumlah (Rp)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            required
            min={10000}
            placeholder="50000"
            className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          <p className="text-xs text-gray-400">Minimum Rp10.000</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-md py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>
      </form>
    </div>
  );
}
