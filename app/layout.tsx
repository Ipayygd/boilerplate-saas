import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/constants";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
