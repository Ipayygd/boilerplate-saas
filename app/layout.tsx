import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} — dibangun dengan Next.js, Supabase, dan Xendit`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
