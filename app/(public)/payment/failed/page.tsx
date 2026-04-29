import Link from "next/link";
import { getPaymentByExternalId } from "@/actions/payment";
import { formatIDR } from "@/utils";
import { ROUTES } from "@/constants";

interface Props {
  searchParams: Promise<{ external_id?: string }>;
}

export default async function PaymentFailedPage({ searchParams }: Props) {
  const { external_id } = await searchParams;
  const payment = external_id ? await getPaymentByExternalId(external_id) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 border rounded-xl bg-white shadow-sm">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold mb-1">Pembayaran Gagal</h1>
        <p className="text-sm text-gray-500 mb-6">
          Transaksi tidak dapat diselesaikan. Kamu bisa mencoba lagi.
        </p>

        {/* Detail pembayaran */}
        {payment && (
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Deskripsi</span>
              <span className="font-medium">{payment.description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Jumlah</span>
              <span className="font-medium">{formatIDR(payment.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-red-500 font-medium">{payment.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ID Transaksi</span>
              <span className="font-mono text-xs text-gray-400">{payment.external_id}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Link
            href="/payment"
            className="inline-block w-full bg-black text-white rounded-md py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Coba Lagi
          </Link>
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-block w-full border rounded-md py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
