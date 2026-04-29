import Link from "next/link";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { LoginForm } from "@/components/forms/LoginForm";
import { ROUTES } from "@/constants";

export default function LoginPage() {
  return (
    <AuthLayout title="Masuk" subtitle="Selamat datang kembali!">
      <LoginForm />
      <p className="text-center text-sm text-gray-500 mt-4">
        Belum punya akun?{" "}
        <Link href={ROUTES.REGISTER} className="font-medium text-black hover:underline">
          Daftar
        </Link>
      </p>
    </AuthLayout>
  );
}
