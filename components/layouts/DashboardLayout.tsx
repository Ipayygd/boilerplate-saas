import { signOut } from "@/actions/auth.action";
import { APP_NAME, ROUTES } from "@/constants";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <Link href={ROUTES.DASHBOARD} className="font-semibold text-lg">
          {APP_NAME}
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            Keluar
          </button>
        </form>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
