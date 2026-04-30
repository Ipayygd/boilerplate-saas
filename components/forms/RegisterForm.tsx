"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/actions/auth.action";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;

    const result = await signUpWithEmail(email, password, username);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  if (success) {
    return (
      <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800">
          Pendaftaran Berhasil!
        </h3>
        <p className="text-green-700 mt-2">
          Silakan cek email kamu untuk mengkonfirmasi akun.
        </p>
        <button
          onClick={() => router.push("/auth/login")} // Asumsi ada route login
          className="mt-4 text-sm text-green-900 underline hover:text-green-700"
        >
          Kembali ke Login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="Username"
          className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="gdlabs@gmail.com"
          className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
          className="border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
        />
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
        {loading ? "Mendaftar..." : "Daftar"}
      </button>
    </form>
  );
}
