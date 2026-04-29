import Link from "next/link";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { ROUTES } from "@/constants";

export default function RegisterPage() {
  return (
    <AuthLayout title="Daftar" subtitle="Buat akun baru kamu">
      <RegisterForm />
      <p className="text-center text-sm text-gray-500 mt-4">
        Sudah punya akun?{" "}
        <Link href={ROUTES.LOGIN} className="font-medium text-black hover:underline">
          Masuk
        </Link>
      </p>
    </AuthLayout>
  );
}
