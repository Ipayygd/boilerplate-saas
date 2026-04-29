import Link from "next/link";
import { APP_NAME, ROUTES } from "@/constants";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold">{APP_NAME}</h1>
      <p className="text-gray-500 text-center max-w-sm">
        Boilerplate Next.js + Supabase + Xendit. Siap dikembangkan.
      </p>
      <div className="flex gap-3">
        <Link
          href={ROUTES.LOGIN}
          className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Masuk
        </Link>
        <Link
          href={ROUTES.REGISTER}
          className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Daftar
        </Link>
      </div>
    </main>
  );
}
