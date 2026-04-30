import Link from "next/link";
import { getPaymentByInvoiceId } from "@/actions/payment";
import { formatIDR } from "@/utils";
import { ROUTES } from "@/constants";

interface Props {
  searchParams: Promise<{ invoice?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: Props) {
  const { invoice } = await searchParams;
  const payment = invoice ? await getPaymentByInvoiceId(invoice) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 border rounded-xl bg-white shadow-sm">
        {/* Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold mb-1">Pembayaran Berhasil!</h1>
        <p className="text-sm text-gray-500 mb-6">
          Terima kasih, transaksi kamu sudah dikonfirmasi.
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
            {payment.final_amount &&
              payment.final_amount !== payment.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Dibayar</span>
                  <span className="font-medium">
                    {formatIDR(payment.final_amount)}
                  </span>
                </div>
              )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Metode</span>
              <span className="font-medium uppercase">
                {payment.payment_method?.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600 font-medium">
                {payment.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Invoice</span>
              <span className="font-mono text-xs text-gray-400">
                {payment.bayargg_invoice_id}
              </span>
            </div>
          </div>
        )}

        <Link
          href={ROUTES.DASHBOARD}
          className="inline-block w-full bg-black text-white rounded-md py-2 text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
